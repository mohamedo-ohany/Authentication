import { NextResponse } from "next/server";

import {
  createToken,
  findByUsernameOrEmail,
  findByUsernameOrEmailStrict,
  getAuthCookieName,
  getTokenTtlSeconds,
  hasValidInternalApiKey,
  hashPassword,
  listUsers,
  saveUsers,
  tokenFromRequest,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyPassword,
  verifyToken,
} from "@/app/lib/renderAuthBackend";

type Params = {
  operation: string;
};

type JsonRecord = Record<string, unknown>;

function json(status: number, body: JsonRecord) {
  return NextResponse.json(body, { status });
}

function withAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: getAuthCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + getTokenTtlSeconds() * 1000),
  });
  return response;
}

async function readBody(request: Request): Promise<JsonRecord | null> {
  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    return body as JsonRecord;
  } catch {
    return null;
  }
}

function requireInternalKey(request: Request): NextResponse | null {
  if (hasValidInternalApiKey(request)) {
    return null;
  }

  return json(401, { ok: 0, message: "Unauthorized request" });
}

function tryCurrentLogin(request: Request): NextResponse | null {
  const token = tokenFromRequest(request);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload) {
    return null;
  }

  return json(200, {
    login: {
      ok: 1,
      data: payload,
    },
  });
}

async function handleSignup(request: Request) {
  const unauthorized = requireInternalKey(request);

  if (unauthorized) {
    return unauthorized;
  }

  const body = await readBody(request);

  if (!body) {
    return json(415, { ok: 0, message: "Only JSON content is supported" });
  }

  if (
    typeof body.username !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return json(400, { ok: 0, message: "Missing Params." });
  }

  const username = body.username.trim();
  const email = body.email.trim();
  const password = body.password;

  const errors: Record<string, string[]> = {};

  validateUsername(username, errors);
  validateEmail(email, errors);
  validatePassword(password, errors);

  if (Object.keys(errors).length > 0) {
    return json(422, {
      ok: 0,
      message: "Invalid inputs",
      errors,
    });
  }

  const users = await listUsers();
  const existing = findByUsernameOrEmailStrict(users, username, email);

  if (existing) {
    if (existing.username === username) {
      errors.username = [...(errors.username || []), "This Username is used before."];
    }

    if (existing.email === email) {
      errors.email = [...(errors.email || []), "This Email is used before."];
    }

    return json(422, {
      ok: 0,
      message: "Invalid inputs",
      errors,
    });
  }

  const createdAt = Math.floor(Date.now() / 1000);
  const nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;

  users.push({
    id: nextId,
    username,
    email,
    passwordHash: hashPassword(password),
    createdAt,
  });

  await saveUsers(users);

  const token = createToken({
    id: nextId,
    username,
    email,
    created_at: createdAt,
  });

  const response = json(200, {
    ok: 1,
    saving_results: { lastID: nextId },
    jwt_token: token,
  });

  return withAuthCookie(response, token);
}

async function handleLogin(request: Request) {
  const unauthorized = requireInternalKey(request);

  if (unauthorized) {
    return unauthorized;
  }

  const existingLogin = tryCurrentLogin(request);

  if (existingLogin) {
    return existingLogin;
  }

  const body = await readBody(request);

  if (!body) {
    return json(415, { ok: 0, message: "Only JSON content is supported" });
  }

  if (typeof body.username_email !== "string" || typeof body.password !== "string") {
    return json(400, { ok: 0, message: "Missing Params." });
  }

  const usernameOrEmail = body.username_email.trim();
  const password = body.password;
  const errors: Record<string, string[]> = {};
  const isEmail = /@/.test(usernameOrEmail);

  if (isEmail) {
    validateEmail(usernameOrEmail, errors, "username_email");
  } else {
    validateUsername(usernameOrEmail, errors, "username_email");
  }

  validatePassword(password, errors);

  if (Object.keys(errors).length > 0) {
    return json(422, {
      ok: 0,
      message: "Invalid inputs",
      errors,
    });
  }

  const users = await listUsers();
  const user = findByUsernameOrEmail(users, usernameOrEmail);

  if (!user) {
    return json(422, {
      ok: 0,
      message: "Invalid inputs",
      errors: [isEmail ? "This Email is not exists." : "This Username is not exists."],
    });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return json(422, {
      ok: 0,
      message: "Invalid inputs",
      errors: {
        password: ["Invalid Password."],
      },
    });
  }

  const token = createToken({
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: Math.floor(Date.now() / 1000),
  });

  const response = json(200, {
    ok: 1,
    jwt_token: token,
  });

  return withAuthCookie(response, token);
}

async function handleIsLoggedIn(request: Request) {
  const unauthorized = requireInternalKey(request);

  if (unauthorized) {
    return unauthorized;
  }

  const token = tokenFromRequest(request);

  if (!token) {
    return json(401, { ok: 0, message: "Invalid Token" });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return json(401, { ok: 0, message: "Invalid Token" });
  }

  return json(200, {
    ok: 1,
    login: {
      ok: 1,
      data: payload,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { operation } = await params;

  if (operation === "signup") {
    return handleSignup(request);
  }

  if (operation === "login") {
    return handleLogin(request);
  }

  if (operation === "isloggedin") {
    return handleIsLoggedIn(request);
  }

  return json(404, { ok: 0, message: "Page Not Found." });
}