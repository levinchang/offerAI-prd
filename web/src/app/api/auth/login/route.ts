import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fail, ErrorCodes } from "@/lib/api-response";

/**
 * 登录接口（占位：开发期可用 userId 直接设 cookie，正式接入手机号/微信后替换）。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { phone, user_id: userIdDev } = body as { phone?: string; user_id?: number };
  const userId = userIdDev ?? (phone ? 1 : undefined);
  if (userId == null) {
    return fail(ErrorCodes.BAD_REQUEST, "缺少 phone 或 user_id（开发用）");
  }
  const res = NextResponse.json(
    { code: 0, message: "success", data: { userId } }
  );
  res.cookies.set("session", String(userId), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
