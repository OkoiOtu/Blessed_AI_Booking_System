import twilio from 'twilio';

const client   = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM     = process.env.TWILIO_PHONE_NUMBER;
const ADMIN    = process.env.ADMIN_PHONE_NUMBER;
const DASH_URL = process.env.DASHBOARD_URL ?? 'https://yourdashboard.com';

export async function sendCustomerConfirmation(booking) {
  const cancelLink = `${DASH_URL}/cancel/${booking.reference}?token=${booking.cancelToken}`;

  const body = [
    `Hi ${booking.caller_name}, your booking is confirmed!`,
    `Ref: ${booking.reference}`,
    `Pickup: ${formatDatetime(booking.pickup_datetime)}`,
    `From: ${booking.pickup_address}`,
    booking.dropoff_address ? `To: ${booking.dropoff_address}` : null,
    `Duration: ${booking.duration_hours}h`,
    `Need to cancel? ${cancelLink}`,
    `Questions? Call us: ${FROM}`,
  ].filter(Boolean).join('\n');

  return client.messages.create({ body, from: FROM, to: booking.callerPhone });
}

export async function sendAdminAlert(payload) {
  const body = payload.isLead ? buildLeadAlert(payload) : buildBookingAlert(payload);
  return client.messages.create({ body, from: FROM, to: ADMIN });
}

function buildBookingAlert(booking) {
  return [
    `New booking — ${booking.reference}`,
    `Name: ${booking.caller_name}`,
    `Phone: ${booking.callerPhone}`,
    `Pickup: ${formatDatetime(booking.pickup_datetime)}`,
    `From: ${booking.pickup_address}`,
    `Duration: ${booking.duration_hours}h`,
    `${DASH_URL}/bookings`,
  ].join('\n');
}

function buildLeadAlert({ callerPhone, summary, callId }) {
  return [
    `New lead — needs review`,
    `Phone: ${callerPhone}`,
    summary,
    `${DASH_URL}/leads`,
  ].join('\n');
}

function formatDatetime(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString('en-NG', {
    weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit',
  });
}
