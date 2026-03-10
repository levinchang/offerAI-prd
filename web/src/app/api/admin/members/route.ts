import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { users, memberRights } from "../../../../../../drizzle/schema";
import { eq, and, gt, desc, count } from "drizzle-orm";

/** 后台会员列表：用户 + 校招/事业编最新到期日 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));

  const userList = await db
    .select({ id: users.id, nickname: users.nickname, createdAt: users.createdAt })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [countRes] = await db.select({ total: count() }).from(users);
  const total = Number(countRes?.total ?? 0);

  const now = new Date();
  const rights = await db
    .select({
      userId: memberRights.userId,
      memberType: memberRights.memberType,
      expireAt: memberRights.expireAt,
    })
    .from(memberRights)
    .where(and(eq(memberRights.status, "active"), gt(memberRights.expireAt, now)));

  const expireByUser: Record<number, { campus: string | null; civil: string | null }> = {};
  for (const r of rights) {
    if (!expireByUser[r.userId]) expireByUser[r.userId] = { campus: null, civil: null };
    const at = r.expireAt ? new Date(r.expireAt).toISOString().slice(0, 10) : null;
    if (r.memberType === "campus" && (!expireByUser[r.userId].campus || (at && at > expireByUser[r.userId].campus!)))
      expireByUser[r.userId].campus = at;
    if (r.memberType === "civil" && (!expireByUser[r.userId].civil || (at && at > expireByUser[r.userId].civil!)))
      expireByUser[r.userId].civil = at;
  }

  const list = userList.map((u) => ({
    id: u.id,
    nickname: u.nickname,
    createdAt: u.createdAt,
    campusExpireAt: expireByUser[u.id]?.campus ?? null,
    civilExpireAt: expireByUser[u.id]?.civil ?? null,
  }));

  return ok({ list, total, page, pageSize });
}
