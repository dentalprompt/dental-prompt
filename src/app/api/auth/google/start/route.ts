import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GOOGLE_STATE_COOKIE = "dp_google_oauth_state";

export async function GET(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.redirect(new URL("/login?error=google_nao_configurado", request.url));
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const next = searchParams.get("next") || "/dashboard";
  const state = `${randomUUID()}:${mode}:${encodeURIComponent(next)}`;

  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("prompt", "select_account");
  googleUrl.searchParams.set("access_type", "offline");

  return NextResponse.redirect(googleUrl);
}
