import { promises as fs } from "node:fs";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type StoredUser = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
};

type TokenPayload = {
  id: number;
  username: string;
  email: string;
  created_at: number;
  exp: number;
};

const USERS_FILE = process.env.AUTH_USERS_FILE?.trim() || "/tmp/auth-users.json";
const JWT_SECRET = process.env.JWT_SECRET?.trim() || "dev-only-change-me";
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME?.trim() || "Token";
const JWT_TTL_SECONDS = Math.max(
  300,
  Number(process.env.JWT_TTL_SECONDS?.trim() || "3600"),
);
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY?.trim();

export function getAuthCookieName() {
  return AUTH_COOKIE_NAME;
}

export function getTokenTtlSeconds() {
  return JWT_TTL_SECONDS;
}

export function hasValidInternalApiKey(request: Request): boolean {
  if (!INTERNAL_API_KEY) {
    return true;
  }

  return request.headers.get("x-internal-api-key") === INTERNAL_API_KEY;
}

export async function listUsers(): Promise<StoredUser[]> {
  try {
    const content = await fs.readFile(USERS_FILE, "utf-8");
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredUser);
  } catch {
    return [];
  }
}

export async function saveUsers(users: StoredUser[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users), "utf-8");
}

export function findByUsernameOrEmail(
  users: StoredUser[],
  usernameOrEmail: string,
): StoredUser | undefined {
  return users.find(
    (user) =>
      user.username === usernameOrEmail || user.email === usernameOrEmail,
  );
}

export function findByUsernameOrEmailStrict(
  users: StoredUser[],
  username: string,
  email: string,
): StoredUser | undefined {
  return users.find((user) => user.username === username || user.email === email);
}

export function validateUsername(
  username: string,
  errors: Record<string, string[]>,
  field = "username",
) {
  if (username.length > 50) {
    errors[field] = [...(errors[field] || []), "Username exceeded the max length 50 chars"];
  }

  if (username.length < 3) {
    errors[field] = [...(errors[field] || []), "Username cannot be less than 3 chars"];
  }

  if (/[^a-zA-Z0-9._-]/.test(username)) {
    errors[field] = [...(errors[field] || []), "Username must be a-zA-Z0-9._-"];
  }
}

export function validateEmail(
  email: string,
  errors: Record<string, string[]>,
  field = "email",
) {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!pattern.test(email)) {
    errors[field] = [...(errors[field] || []), "Invalid Email"];
  }

  if (email.length > 255) {
    errors[field] = [...(errors[field] || []), "Email is longer than 255"];
  }

  if (email.length < 8) {
    errors[field] = [...(errors[field] || []), "Email is too short (min 8 chars)"];
  }
}

export function validatePassword(
  password: string,
  errors: Record<string, string[]>,
  field = "password",
) {
  if (password.length > 50) {
    errors[field] = [...(errors[field] || []), "Password exceeded the max length 50 chars"];
  }

  if (password.length < 6) {
    errors[field] = [...(errors[field] || []), "Password cannot be less than 6 chars"];
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = scryptSync(password, salt, 64).toString("hex");

  try {
    return timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(storedHash, "hex"),
    );
  } catch {
    return false;
  }
}

export function createToken(payload: Omit<TokenPayload, "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const body: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + JWT_TTL_SECONDS,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(body));
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest();

  return `${headerEncoded}.${payloadEncoded}.${base64UrlEncodeBuffer(signature)}`;
}

export function verifyToken(token: string): Omit<TokenPayload, "exp"> | null {
  const [headerEncoded, payloadEncoded, signatureEncoded] = token.split(".");

  if (!headerEncoded || !payloadEncoded || !signatureEncoded) {
    return null;
  }

  const expectedSignature = createHmac("sha256", JWT_SECRET)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest();
  const providedSignature = base64UrlDecodeToBuffer(signatureEncoded);

  if (!providedSignature || !timingSafeEqual(expectedSignature, providedSignature)) {
    return null;
  }

  const payloadRaw = base64UrlDecodeToString(payloadEncoded);

  if (!payloadRaw) {
    return null;
  }

  try {
    const payload = JSON.parse(payloadRaw) as TokenPayload;

    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      created_at: payload.created_at,
    };
  } catch {
    return null;
  }
}

export function tokenFromRequest(request: Request): string {
  const authorization = request.headers.get("authorization") || "";
  const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);

  if (bearerMatch?.[1]) {
    return bearerMatch[1].trim();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    if (cookie.startsWith(`${AUTH_COOKIE_NAME}=`)) {
      return cookie.slice(`${AUTH_COOKIE_NAME}=`.length);
    }
  }

  return "";
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlEncodeBuffer(value: Buffer): string {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeToString(value: string): string | null {
  const padded = value + "=".repeat((4 - (value.length % 4 || 4)) % 4);

  try {
    return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
      "utf-8",
    );
  } catch {
    return null;
  }
}

function base64UrlDecodeToBuffer(value: string): Buffer | null {
  const padded = value + "=".repeat((4 - (value.length % 4 || 4)) % 4);

  try {
    return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  } catch {
    return null;
  }
}

function isStoredUser(value: unknown): value is StoredUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.username === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.passwordHash === "string" &&
    typeof candidate.createdAt === "number"
  );
}