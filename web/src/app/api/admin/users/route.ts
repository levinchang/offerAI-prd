import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { users, memberRights, orders } from "../../../../../../drizzle/schema";
import { desc, count, ilike, eq, and, gt, inArray, sql } from "drizzle-orm";

/** 后台用户列表：分页、关键词筛选；含会员到期与累计消费 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const keyword = searchParams.get("keyword")?.trim();

  const where = keyword ? ilike(users.nickname, `%${keyword}%`) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: users.id,
        nickname: users.nickname,
        createdAt: users.createdAt,
        utmSource: users.utmSource,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    where ? db.select({ total: count() }).from(users).where(where) : db.select({ total: count() }).from(users),
  ]);
  const total = Number(countResult[0]?.total ?? 0);
  const userIds = rows.map((r) => r.id);
  if (userIds.length === 0) return ok({ list: [], total, page, pageSize });

  const now = new Date();
  const [rightsRows, payRows] = await Promise.all([
    db
      .select({
        userId: memberRights.userId,
        memberType: memberRights.memberType,
        expireAt: memberRights.expireAt,
      })
      .from(memberRights)
      .where(
        and(
          eq(memberRights.status, "active"),
          gt(memberRights.expireAt, now),
          inArray(memberRights.userId, userIds)
        )
      ),
    db
      .select({
        userId: orders.userId,
        total: sql<string>`COALESCE(SUM(CAST(${orders.payAmount} AS NUMERIC)), 0)`,
      })
      .from(orders)
      .where(and(eq(orders.orderStatus, "paid"), inArray(orders.userId, userIds)))
      .groupBy(orders.userId),
  ]);

  const expireByUser: Record<number, { campus: string | null; civil: string | null }> = {};
  for (const r of rightsRows) {
    if (!expireByUser[r.userId]) expireByUser[r.userId] = { campus: null, civil: null };
    const at = r.expireAt ? new Date(r.expireAt).toISOString().slice(0, 10) : null;
    if (r.memberType === "campus" && (!expireByUser[r.userId].campus || (at && at > expireByUser[r.userId].campus!)))
      expireByUser[r.userId].campus = at;
    if (r.memberType === "civil" && (!expireByUser[r.userId].civil || (at && at > expireByUser[r.userId].civil!)))
      expireByUser[r.userId].civil = at;
  }
  const payByUser: Record<number, string> = {};
  for (const p of payRows) payByUser[p.userId] = String(p.total ?? "0");

  const list = rows.map((r) => ({
    id: r.id,
    nickname: r.nickname,
    createdAt: r.createdAt,
    utmSource: r.utmSource,
    campusExpireAt: expireByUser[r.id]?.campus ?? null,
    civilExpireAt: expireByUser[r.id]?.civil ?? null,
    totalPayAmount: payByUser[r.id] ?? "0",
  }));
  return ok({ list, total, page, pageSize });
}
