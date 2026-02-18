import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Decode a JWT payload without verifying the signature.
 * Safe to use for client-side routing decisions — the backend
 * re-verifies the signature on every protected API call.
 */
export function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

/**
 * Get the user tier from the stored JWT without any network call.
 * Falls back to "free" if the token is missing or malformed.
 */
export function getTokenTier() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return "free";
    return decodeJWT(token)?.tier || "free";
  } catch {
    return "free";
  }
}
