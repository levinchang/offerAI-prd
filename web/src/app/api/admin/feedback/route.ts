import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { feedback } from "../../../../../../drizzle/schema";
import { desc, eq, count } from "drizzle-orm";

/** 后台反馈列表：分页、按状态筛选 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const status = searchParams.get("status")?.trim();

  const where = status ? eq(feedback.status, status) : undefined;

  const [rows, countResult] = await Promise.all([
    db.select().from(feedback).where(where).orderBy(desc(feedback.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    where ? db.select({ total: count() }).from(feedback).where(where) : db.select({ total: count() }).from(feedback),
  ]);
  const total = Number(countResult[0]?.total ?? 0);
  return ok({ list: rows, total, page, pageSize });
}
