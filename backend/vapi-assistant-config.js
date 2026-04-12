/**
 * vapi-assistant-config.js
 *
 * Paste the values from this file into your Vapi dashboard when
 * creating or editing your assistant.
 *
 * Dashboard → Assistants → [Your Assistant] → Model → System Prompt
 *                                            → Analysis → Structured Data
 *
 * You do NOT import or run this file — it is a configuration reference.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// Paste this into: Assistant → Model → System Prompt
// ─────────────────────────────────────────────────────────────────────────────

export const SYSTEM_PROMPT = `
You are Aria, a professional booking assistant for a transportation company based in Lagos, Nigeria.
Your job is to answer inbound calls and collect the information needed to book an hourly vehicle hire.

## Your personality
- Warm, calm, and efficient
- Speak in plain conversational English — no jargon
- Keep the call focused. Do not go off-topic.
- If the caller asks something outside of bookings (e.g. prices, company info), politely say you can only help with bookings and a human will follow up.

## What you must collect
You MUST collect all of the following before ending the call:

1. Caller's full name
2. Pickup date (e.g. "next Saturday", "April 10th")
3. Pickup time (e.g. "10am", "half past two")
4. Pickup address (full address including area/landmark if possible)
5. How many hours they need the vehicle (must be a number between 1 and 12)

## Optional (collect if offered)
- Drop-off address (if they mention it — not all hourly hires have a fixed drop-off)

## Conversation flow
1. Greet the caller warmly and introduce yourself
2. Ask for their name first
3. Ask for their pickup date and time (collect both in one question if natural)
4. Ask for their pickup address
5. Ask how many hours they need the vehicle
6. Repeat the booking details back to the caller clearly for confirmation
7. Let them know they will receive an SMS confirmation shortly
8. Thank them and end the call professionally

## Important rules
- If the caller cannot provide a pickup date, time, address, or duration — do not confirm a booking. Tell them a human agent will call them back.
- If the requested duration is more than 12 hours or less than 1 hour, do not auto-confirm. Tell them this request will be reviewed by the team.
- Never make up or guess information. If you are unsure what the caller said, ask them to repeat it.
- Always confirm the full details back to the caller before ending the call.
- Do not quote prices. Say "pricing will be confirmed in your SMS or by our team."

## Ending the call
Close with: "Thank you, [Name]. You'll receive an SMS confirmation shortly. Have a great day!"
`.trim();


// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED DATA SCHEMA
// Paste this into: Assistant → Analysis → Structured Data → Schema
// This tells Vapi what fields to extract from the conversation and
// send to your backend in the end-of-call-report webhook payload.
// ─────────────────────────────────────────────────────────────────────────────

export const STRUCTURED_DATA_SCHEMA = {
  type: "object",
  properties: {

    callerName: {
      type: "string",
      description: "Full name of the caller as they stated it.",
    },

    pickupDatetime: {
      type: "string",
      description:
        "The pickup date and time in ISO 8601 format (e.g. 2025-04-10T10:00:00). " +
        "Convert relative references like 'next Saturday at 10am' to an absolute datetime. " +
        "Use the current date as the reference point. If the year is ambiguous, assume the next upcoming occurrence.",
    },

    pickupAddress: {
      type: "string",
      description:
        "Full pickup address as stated by the caller, including street, area, and city if mentioned.",
    },

    dropoffAddress: {
      type: "string",
      description:
        "Drop-off address if the caller mentioned one. Leave empty string if not provided.",
    },

    durationHours: {
      type: "number",
      description:
        "Number of hours the caller requested for the vehicle hire. Must be a number (e.g. 3, not 'three hours').",
    },

    callerConfirmed: {
      type: "boolean",
      description:
        "True if the caller verbally confirmed the booking details when they were read back to them. False if they did not confirm or the call ended before confirmation.",
    },

    incompleteReason: {
      type: "string",
      description:
        "If any required field could not be collected, briefly state why (e.g. 'caller could not provide pickup time', 'call dropped before confirmation'). Leave empty string if all fields were collected successfully.",
    },

  },
  required: [
    "callerName",
    "pickupDatetime",
    "pickupAddress",
    "durationHours",
    "callerConfirmed",
  ],
};


// ─────────────────────────────────────────────────────────────────────────────
// VAPI ASSISTANT SETTINGS (reference)
// Set these manually in your Vapi dashboard.
// ─────────────────────────────────────────────────────────────────────────────

export const VAPI_SETTINGS_REFERENCE = {
  voice: {
    provider: "11labs",              // ElevenLabs gives the most natural Nigerian-English voice
    voiceId: "rachel",               // or choose another from ElevenLabs library
  },
  model: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.4,               // Lower = more consistent, less hallucination
  },
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  silenceTimeoutSeconds: 10,
  maxDurationSeconds: 600,          // 10 minute max call
  endCallMessage: "Thank you for calling. Have a great day!",
  webhook: {
    url: "https://your-server.com/webhook/vapi",
    secret: "YOUR_VAPI_WEBHOOK_SECRET",  // must match VAPI_WEBHOOK_SECRET in backend .env
  },
};