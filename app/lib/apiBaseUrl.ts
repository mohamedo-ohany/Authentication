const FALLBACK_API_BASE_URL = "https://authentication-waad.onrender.com";

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

const rawApiBaseUrl =
  process.env.API_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  FALLBACK_API_BASE_URL;

export const API_BASE_URL = normalizeBaseUrl(rawApiBaseUrl);
