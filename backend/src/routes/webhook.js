import express from 'express';
import { processCall } from '../services/bookingService.js';
import { validateVapiWebhook } from '../middleware/validateWebhook.js';

const router = express.Router();

/**
 * POST /webhook/vapi
 *
 * Vapi calls this endpoint at the end of every inbound call.
 * It fires an "end-of-call-report" event containing the transcript,
 * recording URL, call metadata, and any structured data your
 * Vapi assistant was configured to extract.
 *
 * Vapi expects a 200 response quickly (< 5s). Heavy work goes async.
 */
router.post('/vapi', validateVapiWebhook, async (req, res) => {
  // Acknowledge receipt immediately so Vapi doesn't retry
  res.status(200).json({ received: true });

  const { message } = req.body;

  // Vapi sends several event types. We only act on end-of-call-report.
  if (!message || message.type !== 'end-of-call-report') {
    return;
  }

  try {
    await processCall(message);
  } catch (err) {
    // Errors here are logged only — we've already sent 200 to Vapi
    console.error('[webhook] processCall failed:', err.message, {
      callId: message?.call?.id,
      stack: err.stack,
    });
  }
});

export default router;