import express from 'express';
import { getClient } from '../services/pbService.js';
import { logActivity } from '../services/activityLogger.js';

const router = express.Router();

const esc = v => String(v ?? '').replace(/"/g, '');

/**
 * POST /auth/register
 * Creates a new user + company. Called from the signup page.
 * Uses the backend's admin PocketBase client so user creation works.
 */
router.post('/register', async (req, res) => {
  try {
    const pb = await getClient();
    const { name, email, password, companyName, slug, city, phone, plan = 'starter' } = req.body;

    if (!name || !email || !password || !companyName || !slug) {
      return res.status(400).json({ error: 'name, email, password, companyName and slug are all required.' });
    }

    // 1. Check email not already taken
    try {
      const existing = await pb.collection('users').getFirstListItem(
        `email = "${esc(email)}"`, { requestKey: null }
      );
      if (existing) return res.status(409).json({ error: 'This email address is already registered.' });
    } catch { /* not found = good */ }

    // 2. Check slug not already taken
    try {
      const existingSlug = await pb.collection('companies').getFirstListItem(
        `slug = "${esc(slug)}"`, { requestKey: null }
      );
      if (existingSlug) return res.status(409).json({ error: 'This company slug is already taken. Choose a different one.' });
    } catch { /* not found = good */ }

    // 3. Create company first
    const company = await pb.collection('companies').create({
      name:   companyName,
      slug,
      city:   city  ?? '',
      phone:  phone ?? '',
      plan,
      active: true,
    }, { requestKey: null });

    // 4. Create user linked to company
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      full_name:       name,
      role:            'super_admin',
      company_id:      company.id,
      suspended:       false,
      emailVisibility: true,
      verified:        false,
    }, { requestKey: null });

    // 5. Send verification email
    try {
      await pb.collection('users').requestVerification(email);
    } catch (err) {
      console.warn('[auth/register] verification email failed:', err.message);
    }

    await logActivity('user_registered', name, `New super_admin registered: ${email} (${companyName})`, company.id);

    res.json({
      success:   true,
      userId:    user.id,
      companyId: company.id,
      email:     user.email,
    });
  } catch (err) {
    console.error('[auth/register] error:', err.message);
    // Return the actual PocketBase error so the frontend can show it
    res.status(500).json({ error: err.message ?? 'Registration failed. Please try again.' });
  }
});

/**
 * GET /auth/check-email?email=...
 * Returns { exists: true/false } — used for real-time email availability check on signup.
 */
router.get('/check-email', async (req, res) => {
  const email = String(req.query.email ?? '').trim();
  if (!email.includes('@')) return res.json({ exists: false });
  try {
    const pb = await getClient();
    try {
      await pb.collection('users').getFirstListItem(`email = "${esc(email)}"`, { requestKey: null });
      return res.json({ exists: true });
    } catch {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('[auth/check-email] error:', err.message);
    res.json({ exists: false }); // fail open — /register will catch it on submit
  }
});

/**
 * GET /auth/check-slug?slug=...
 * Returns { exists: true/false } — used for real-time slug availability check on signup.
 */
router.get('/check-slug', async (req, res) => {
  const slug = String(req.query.slug ?? '').trim();
  if (!slug) return res.json({ exists: false });
  try {
    const pb = await getClient();
    try {
      await pb.collection('companies').getFirstListItem(`slug = "${esc(slug)}"`, { requestKey: null });
      return res.json({ exists: true });
    } catch {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('[auth/check-slug] error:', err.message);
    res.json({ exists: false }); // fail open — /register will catch it on submit
  }
});

/**
 * POST /auth/resend-verification
 * Resends email verification link to an existing user email.
 * Returns a generic success response to avoid leaking account existence.
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const pb = await getClient();
    const { email } = req.body;

    if (!email || !String(email).includes('@')) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }

    try {
      await pb.collection('users').requestVerification(email);
    } catch (err) {
      // Keep response generic even if email doesn't exist or send fails
      console.warn('[auth/resend-verification] request failed:', err.message);
    }

    res.json({ success: true, message: 'If this email exists, a verification link has been sent.' });
  } catch (err) {
    console.error('[auth/resend-verification] error:', err.message);
    res.status(500).json({ error: 'Could not process verification resend right now.' });
  }
});

export default router;
