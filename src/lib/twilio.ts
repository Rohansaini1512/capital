/**
 * Twilio Client helper
 */
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";

export function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured");
  }
  return Twilio(accountSid, authToken);
}

export const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER || "";


