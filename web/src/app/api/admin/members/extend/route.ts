import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { memberRights } from "../../../../../../../drizzle/schema";
import { eq, and, gt, desc } from "drizzle-orm";

/** 手动延长会员：为指定用户增加校招或事业编权益 */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const userId = Number(body.user_id ?? body.userId);
  const memberType = body.member_type ?? body.memberType;
  const days = Math.max(1, Math.min(365 * 2, Number(body.days) || 30));
  if (!Number.isInteger(userId) || userId < 1) return fail(ErrorCodes.BAD_REQUEST, "user_id 无效");
  if (memberType !== "campus" && memberType !== "civil") return fail(ErrorCodes.BAD_REQUEST, "member_type 须为 campus 或 civil");

  const now = new Date();
  const [existing] = await db
    .select()
    .from(memberRights)
    .where(and(eq(memberRights.userId, userId), eq(memberRights.memberType, memberType), eq(memberRights.status, "active"), gt(memberRights.expireAt, now)))
    .orderBy(desc(memberRights.expireAt))
    .limit(1);

  let startAt: Date;
  let expireAt: Date;
  if (existing?.expireAt && new Date(existing.expireAt) > now) {
    startAt = new Date(existing.expireAt);
    expireAt = new Date(startAt);
    expireAt.setDate(expireAt.getDate() + days);
    await db.update(memberRights).set({ expireAt }).where(eq(memberRights.id, existing.id));
  } else {
    startAt = now;
    expireAt = new Date(now);
    expireAt.setDate(expireAt.getDate() + days);
    await db.insert(memberRights).values({
      userId,
      memberType,
      startAt,
      expireAt,
      status: "active",
      createdAt: now,
    });
  }
  return ok({ ok: true, expire_at: expireAt.toISOString().slice(0, 10) });
}
