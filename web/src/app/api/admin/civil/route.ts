import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { civilPosts } from "../../../../../../drizzle/schema";
import { desc, ilike, eq, and, count, sql } from "drizzle-orm";

/** 后台事业编列表：全部状态，分页、关键词筛选 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const keyword = searchParams.get("keyword")?.trim();
  const publishStatus = searchParams.get("publishStatus")?.trim();

  const conditions = [];
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      sql`(${ilike(civilPosts.title, pattern)} OR ${ilike(civilPosts.detail, pattern)})`
    );
  }
  if (publishStatus) conditions.push(eq(civilPosts.publishStatus, publishStatus));
  const where = conditions.length ? and(...conditions) : undefined;

  try {
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(civilPosts)
        .where(where)
        .orderBy(desc(civilPosts.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      where
        ? db.select({ total: count() }).from(civilPosts).where(where)
        : db.select({ total: count() }).from(civilPosts),
    ]);
    const total = countResult[0]?.total ?? 0;
    return ok({ list: rows, total: Number(total), page, pageSize });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
