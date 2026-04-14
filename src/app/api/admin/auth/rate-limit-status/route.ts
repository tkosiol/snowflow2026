import { NextResponse } from "next/server";
import { getClientIp, isLoginRateLimited } from "@/lib/login-rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const status = isLoginRateLimited(ip);
  return NextResponse.json(status);
}
