import { createCall, createBooking, createLead, markSmsSent } from './pbService.js';
import { sendCustomerConfirmation, sendAdminAlert } from './smsService.js';
import { formatE164, isValidPhone } from '../utils/phoneUtils.js';
import { generateBookingRef } from '../utils/bookingUtils.js';
import { generateCancelToken } from '../utils/tokenUtils.js';
import { calculatePrice, formatPrice } from './pricingService.js';
import { logActivity } from './activityLogger.js';

const MIN_HOURS = 1;
const MAX_HOURS = 12;

function qualifyBooking(data) {
  const { callerName, pickupDatetime, pickupAddress, durationHours } = data;
  if (!callerName?.trim())    return { valid: false, reason: 'missing_caller_name' };
  if (!pickupAddress?.trim()) return { valid: false, reason: 'missing_pickup_address' };
  if (!pickupDatetime)        return { valid: false, reason: 'missing_pickup_datetime' };
  const pickup = new Date(pickupDatetime);
  if (isNaN(pickup.getTime())) return { valid: false, reason: 'invalid_pickup_datetime' };
  if (pickup < new Date())     return { valid: false, reason: 'pickup_in_the_past' };
  const hours = Number(durationHours);
  if (!hours || hours < MIN_HOURS || hours > MAX_HOURS) {
    return { valid: false, reason: `duration_out_of_range (${hours}h — must be ${MIN_HOURS}-${MAX_HOURS}h)` };
  }
  return { valid: true };
}

export async function processCall(message) {
  const { call, artifact, analysis } = message;
  const rawPhone   = call?.customer?.number ?? '';
  const callerPhone = formatE164(rawPhone);

  if (!isValidPhone(callerPhone)) {
    console.warn('[bookingService] Invalid or missing caller phone:', rawPhone);
  }

  const callDuration = call?.endedAt && call?.startedAt
    ? Math.round((new Date(call.endedAt) - new Date(call.startedAt)) / 1000)
    : 0;

  const callRecord = await createCall({
    vapi_call_id:  call?.id ?? '',
    caller_phone:  callerPhone,
    transcript:    artifact?.transcript ?? '',
    recording_url: artifact?.recordingUrl ?? '',
    duration_secs: callDuration,
    outcome:       'incomplete',
  });

  const structured = analysis?.structuredData ?? {};
  console.info('[bookingService] Structured data received:', structured);

  // Extract vehicle type from structured data (optional field)
  const vehicleType = structured.vehicleType ?? 'any';

  const qualification = qualifyBooking(structured);
  if (qualification.valid) {
    await handleConfirmedBooking(callRecord, structured, callerPhone, vehicleType);
  } else {
    await handleLead(callRecord, structured, callerPhone, qualification.reason);
  }
}

async function handleConfirmedBooking(callRecord, data, callerPhone, vehicleType = 'any') {
  const reference   = generateBookingRef();
  const cancelToken = generateCancelToken();

  // Calculate price from pricing rules
  const pricing = await calculatePrice({
    pickupAddress:  data.pickupAddress,
    dropoffAddress: data.dropoffAddress ?? '',
    durationHours:  Number(data.durationHours),
    vehicleType,
  });

  const quotedPrice    = pricing?.price    ?? null;
  const quotedCurrency = pricing?.currency ?? 'NGN';
  const pricingRule    = pricing?.ruleName ?? null;

  console.info(`[bookingService] Price calculated: ${quotedPrice ? formatPrice(quotedPrice, quotedCurrency) : 'No rule matched'}`);

  const booking = await createBooking({
    reference,
    caller_name:     data.callerName,
    caller_phone:    callerPhone,
    pickup_datetime: data.pickupDatetime,
    pickup_address:  data.pickupAddress,
    dropoff_address: data.dropoffAddress ?? '',
    duration_hours:  Number(data.durationHours),
    status:          'confirmed',
    cancel_token:    cancelToken,
    quoted_price:    quotedPrice,
    quoted_currency: quotedCurrency,
    pricing_rule:    pricingRule,
    vehicle_type:    vehicleType !== 'any' ? vehicleType : '',
    sms_sent:        false,
    call:            callRecord.id,
  });

  await callRecord.$update({ outcome: 'confirmed' });
  await logActivity('booking_confirmed', callerPhone, `Booking ${reference} confirmed for ${data.callerName}`);
  console.info(`[bookingService] Booking confirmed: ${reference}`);

  try {
    await Promise.all([
      sendCustomerConfirmation({ ...booking, callerPhone, cancelToken, quotedPrice, quotedCurrency }),
      sendAdminAlert({ ...booking, callerPhone }),
    ]);
    await markSmsSent(booking.id);
  } catch (err) {
    console.error('[bookingService] SMS send failed:', err.message);
  }
}

async function handleLead(callRecord, data, callerPhone, reason) {
  const summary = buildLeadSummary(data, reason);
  await createLead({ caller_phone: callerPhone, summary, status: 'new', call: callRecord.id });
  await callRecord.$update({ outcome: 'lead' });
  await logActivity('lead_created', callerPhone, `Lead created. Reason: ${reason}`);
  console.info(`[bookingService] Call logged as lead. Reason: ${reason}`);

  try {
    await sendAdminAlert({ isLead: true, callerPhone, summary, callId: callRecord.id });
  } catch (err) {
    console.error('[bookingService] Admin lead alert failed:', err.message);
  }
}

function buildLeadSummary(data, reason) {
  const lines = [`Disqualification reason: ${reason}`];
  if (data.callerName)     lines.push(`Name: ${data.callerName}`);
  if (data.pickupAddress)  lines.push(`Pickup: ${data.pickupAddress}`);
  if (data.pickupDatetime) lines.push(`Requested time: ${data.pickupDatetime}`);
  if (data.durationHours)  lines.push(`Duration: ${data.durationHours}h`);
  return lines.join('\n');
}
