import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { syncTasks } from "../../../../../../drizzle/schema";
import { desc, eq, and, count } from "drizzle-orm";

/** 任务列表：分页、按 data_type / status 筛选 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const dataType = searchParams.get("dataType")?.trim();
  const status = searchParams.get("status")?.trim();

  const conditions = [];
  if (dataType) conditions.push(eq(syncTasks.dataType, dataType));
  if (status) conditions.push(eq(syncTasks.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(syncTasks)
      .where(where)
      .orderBy(desc(syncTasks.startedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    where ? db.select({ total: count() }).from(syncTasks).where(where) : db.select({ total: count() }).from(syncTasks),
  ]);
  const total = Number(countResult[0]?.total ?? 0);
  return ok({ list: rows, total, page, pageSize });
}
