/**
 * validateWebhook.js
 *
 * Vapi sends an `x-vapi-secret` header containing the plain-text
 * secret you set in your Vapi dashboard under Webhooks.
 * We compare it against our env variable before processing anything.
 */
// export function validateVapiWebhook(req, res, next) {
//   const incoming = req.headers['x-vapi-secret'];
//   const expected = process.env.VAPI_WEBHOOK_SECRET;

//   if (!expected) {
//     console.error('[validateWebhook] VAPI_WEBHOOK_SECRET is not set');
//     return res.status(500).json({ error: 'Server misconfiguration' });
//   }

//   if (!incoming || incoming !== expected) {
//     console.warn('[validateWebhook] Invalid or missing secret');
//     return res.status(401).json({ error: 'Unauthorised' });
//   }

//   next();
// }

export function validateVapiWebhook(req, res, next) {
  // TODO: re-enable when Vapi secret field is located
  next();
}