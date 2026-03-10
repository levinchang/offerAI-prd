import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { admins } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { setAdminSession } from "@/lib/admin-session";

/** 与入库一致：首次创建管理员时 password_hash = hashPassword('你的密码') 写入 admins 表 */
function hashPassword(password: string): string {
  return createHash("sha256").update(String(password)).digest("hex");
}

/** 管理员登录：校验用户名密码，写 admin session cookie */
export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return fail(ErrorCodes.BAD_REQUEST, "请求体无效");
  }
  const username = body.username?.trim();
  const password = body.password;
  if (!username || password === undefined)
    return fail(ErrorCodes.BAD_REQUEST, "请填写用户名和密码");

  const [admin] = await db
    .select({ id: admins.id, passwordHash: admins.passwordHash, status: admins.status })
    .from(admins)
    .where(eq(admins.username, username))
    .limit(1);

  if (!admin || admin.status !== "active")
    return fail(ErrorCodes.UNAUTHORIZED, "用户名或密码错误");

  const hash = hashPassword(password);
  if (hash !== admin.passwordHash)
    return fail(ErrorCodes.UNAUTHORIZED, "用户名或密码错误");

  await setAdminSession(admin.id);
  return ok({ ok: true });
}
