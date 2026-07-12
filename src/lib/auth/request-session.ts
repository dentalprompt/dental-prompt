import { verifyAccessToken } from "@/lib/auth/jwt";

export function getRequestSession(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const accessToken = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("dp_access_token="))
    ?.split("=")[1];

  if (!accessToken) {
    return null;
  }

  try {
    return verifyAccessToken(accessToken);
  } catch {
    return null;
  }
}
