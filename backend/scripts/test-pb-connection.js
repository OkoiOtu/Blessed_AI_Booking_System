/**
 * test-pb-connection.js
 *
 * Run this before starting your backend to confirm:
 *   - PocketBase is reachable
 *   - Admin credentials are correct
 *   - All 3 collections exist with the expected fields
 *
 * Usage:
 *   npm run test:db
 *   node scripts/test-pb-connection.js
 */

import "dotenv/config";
import PocketBase from "pocketbase";

const REQUIRED_COLLECTIONS = {
  calls:    ["vapi_call_id", "caller_phone", "transcript", "recording_url", "duration_secs", "outcome"],
  bookings: ["reference", "caller_name", "caller_phone", "pickup_datetime", "pickup_address", "duration_hours", "sms_sent", "call"],
  leads:    ["caller_phone", "summary", "status", "call"],
};

async function run() {
  const url = process.env.POCKETBASE_URL;
  console.log(`\nConnecting to PocketBase at ${url}...\n`);

  const pb = new PocketBase(url);

  // ── Auth ──────────────────────────────────────────────────────────────────
  // PocketBase v0.23+ renamed "admins" to "_superusers"
  try {
    await pb.collection('_superusers').authWithPassword(
      process.env.PB_ADMIN_EMAIL,
      process.env.PB_ADMIN_PASSWORD
    );
    console.log("✓ Admin auth successful");
  } catch (err) {
    console.error("✗ Admin auth failed:", err.message);
    console.error("  Check POCKETBASE_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD in your .env");
    process.exit(1);
  }

  // ── Collections ───────────────────────────────────────────────────────────
  let allGood = true;

  for (const [name, expectedFields] of Object.entries(REQUIRED_COLLECTIONS)) {
    try {
      const collection = await pb.collections.getOne(name);
      const actualFields = collection.fields.map((f) => f.name);

      const missing = expectedFields.filter((f) => !actualFields.includes(f));

      if (missing.length > 0) {
        console.error(`✗ Collection "${name}" is missing fields: ${missing.join(", ")}`);
        allGood = false;
      } else {
        console.log(`✓ Collection "${name}" — all fields present`);
      }
    } catch {
      console.error(`✗ Collection "${name}" not found — did you create it in the PocketBase UI?`);
      allGood = false;
    }
  }

  // ── Result ────────────────────────────────────────────────────────────────
  console.log("");
  if (allGood) {
    console.log("All checks passed. PocketBase is ready.\n");
  } else {
    console.log("Some checks failed. Fix the issues above before starting the backend.\n");
    process.exit(1);
  }
}

run();