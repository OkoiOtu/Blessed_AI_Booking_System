import express from 'express';
import crypto  from 'crypto';
import { getClient } from '../services/pbService.js';
import { logActivity } from '../services/activityLogger.js';

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const DASHBOARD_URL   = process.env.DASHBOARD_URL ?? 'http://localhost:3001';

const PLAN_AMOUNTS = {
  // Amounts in kobo (NGN) or cents (USD) — Paystack uses lowest currency unit
  professional: { ngn: 4900000, usd: 4900 }, // ₦49,000 or $49
  enterprise:   { ngn: null,    usd: null  }, // contact sales
};

const PLAN_NAMES = {
  professional: 'Ariva Professional',
  enterprise:   'Ariva Enterprise',
};

/**
 * POST /payments/initialize
 * Creates a Paystack payment session and returns the checkout URL.
 */
router.post('/initialize', async (req, res) => {
  if (!PAYSTACK_SECRET) {
    return res.status(500).json({ error: 'Payment system not configured. Add PAYSTACK_SECRET_KEY to environment.' });
  }

  const { plan, companyId, email, currency = 'NGN' } = req.body;
  if (!plan || !companyId || !email) {
    return res.status(400).json({ error: 'plan, companyId and email are required.' });
  }
  if (!PLAN_AMOUNTS[plan]) {
    return res.status(400).json({ error: 'Invalid plan.' });
  }
  if (PLAN_AMOUNTS[plan][currency.toLowerCase()] === null) {
    return res.status(400).json({ error: 'Enterprise plan requires direct contact. Email hello@ariva.ai.' });
  }

  try {
    const amount   = PLAN_AMOUNTS[plan][currency.toLowerCase()];
    const ref      = `ariva_${companyId}_${plan}_${Date.now()}`;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        currency: currency.toUpperCase(),
        reference:    ref,
        callback_url: `${DASHBOARD_URL}/checkout/callback`,
        metadata: {
          plan,
          companyId,
          custom_fields: [
            { display_name: 'Plan',       variable_name: 'plan',      value: plan       },
            { display_name: 'Company ID', variable_name: 'companyId', value: companyId  },
          ],
        },
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      }),
    });

    const data = await response.json();
    if (!data.status) throw new Error(data.message ?? 'Paystack initialization failed');

    // Store pending payment record
    const pb = await getClient();
    await pb.collection('payments').create({
      company_id:  companyId,
      plan,
      amount:      amount / 100,
      currency:    currency.toUpperCase(),
      reference:   ref,
      status:      'pending',
      email,
    }, { requestKey: null }).catch(() => {}); // non-fatal

    res.json({
      success:      true,
      checkoutUrl:  data.data.authorization_url,
      reference:    ref,
      accessCode:   data.data.access_code,
    });
  } catch (err) {
    console.error('[payments] initialize error:', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to initialize payment.' });
  }
});

/**
 * POST /payments/webhook
 * Paystack sends payment events here. Verifies signature and activates plan.
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const body      = req.body;

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    console.warn('[payments] Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(body);
  console.info('[payments] Webhook event:', event.event);

  if (event.event === 'charge.success') {
    const { reference, metadata, amount, currency } = event.data;
    const { plan, companyId } = metadata ?? {};

    if (!plan || !companyId) {
      console.warn('[payments] Missing metadata in webhook');
      return res.sendStatus(200);
    }

    try {
      const pb = await getClient();

      // Idempotency: skip if this reference was already processed successfully
      const existing = await pb.collection('payments').getFullList({
        filter: `reference = "${reference}" && status = "paid"`, requestKey: null,
      });
      if (existing.length > 0) {
        console.info(`[payments] Duplicate webhook for reference ${reference} — skipping`);
        return res.sendStatus(200);
      }

      // Activate the plan on the company
      await pb.collection('companies').update(companyId, {
        plan,
        plan_activated_at: new Date().toISOString(),
        active: true,
      }, { requestKey: null });

      // Update payment record
      const payments = await pb.collection('payments').getFullList({
        filter: `reference = "${reference}"`, requestKey: null,
      });
      if (payments.length > 0) {
        await pb.collection('payments').update(payments[0].id, {
          status: 'paid',
          paid_at: new Date().toISOString(),
        }, { requestKey: null });
      }

      await logActivity(
        'plan_upgraded',
        `System`,
        `Company ${companyId} upgraded to ${plan} plan. Ref: ${reference}`,
        companyId
      );

      console.info(`[payments] Plan activated: ${plan} for company ${companyId}`);
    } catch (err) {
      console.error('[payments] Failed to activate plan:', err.message);
    }
  }

  res.sendStatus(200);
});

/**
 * GET /payments/verify/:reference
 * Called after redirect from Paystack to confirm payment status.
 */
router.get('/verify/:reference', async (req, res) => {
  if (!PAYSTACK_SECRET) return res.status(500).json({ error: 'Payment not configured.' });

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await response.json();

    if (!data.status) throw new Error(data.message ?? 'Verification failed');

    const tx = data.data;
    res.json({
      status:    tx.status,
      plan:      tx.metadata?.plan,
      companyId: tx.metadata?.companyId,
      amount:    tx.amount / 100,
      currency:  tx.currency,
      paidAt:    tx.paid_at,
      reference: tx.reference,
    });
  } catch (err) {
    res.status(500).json({ error: err.message ?? 'Verification failed.' });
  }
});

/**
 * GET /payments/history
 * Returns payment history for a company.
 */
router.get('/history', async (req, res) => {
  try {
    const pb      = await getClient();
    const filter  = req.companyId ? `company_id = "${req.companyId}"` : '';
    const result  = await pb.collection('payments').getFullList({
      filter, sort: '-created', requestKey: null,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment history.' });
  }
});

export default router;
