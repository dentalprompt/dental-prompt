import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { verifyAccessToken } from "@/lib/auth/jwt";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}
