import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";
import {
  getSessionSecret,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  SESSION_REMEMBER_MAX_AGE,
} from "./config";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  name: string;
  companyId?: string;
  companySlug?: string;
  driverId?: string;
  customerId?: string;
};

type CreateSessionOptions = {
  remember?: boolean;
};

function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export async function createSession(
  payload: SessionPayload,
  options?: CreateSessionOptions,
) {
  const maxAge = options?.remember ? SESSION_REMEMBER_MAX_AGE : SESSION_MAX_AGE;

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
