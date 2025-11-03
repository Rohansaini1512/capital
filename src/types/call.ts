/**
 * Type definitions for Call entities
 */

export type CallStatus =
  | "PENDING"
  | "RINGING"
  | "IN_PROGRESS"
  | "HUMAN_DETECTED"
  | "VOICEMAIL_DETECTED"
  | "MACHINE_DETECTED"
  | "FAILED"
  | "COMPLETED";

export type AMDStrategy = "gemini" | "huggingface" | "jambonz";
