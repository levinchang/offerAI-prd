import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { campusJobs } from "../../../../../../drizzle/schema";
import { desc, ilike, eq, and, count, sql } from "drizzle-orm";

/** 后台校招岗位列表：分页、关键词/状态筛选 */
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
      sql`(${ilike(campusJobs.jobTitle, pattern)} OR ${ilike(campusJobs.companyName, pattern)} OR ${ilike(campusJobs.sourceName, pattern)})`
    );
  }
  if (publishStatus) conditions.push(eq(campusJobs.publishStatus, publishStatus));
  const where = conditions.length ? and(...conditions) : undefined;

  try {
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(campusJobs)
        .where(where)
        .orderBy(desc(campusJobs.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      where
        ? db.select({ total: count() }).from(campusJobs).where(where)
        : db.select({ total: count() }).from(campusJobs),
    ]);
    const total = countResult[0]?.total ?? 0;
    return ok({ list: rows, total: Number(total), page, pageSize });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}

/** 后台：新增校招岗位 */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const sourceKey =
    body.source_key?.trim() || body.sourceKey?.trim() || `campus_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date();
  const allow = [
    "sourceLabel", "companyName", "companyType", "recruitType", "city", "jobTitle",
    "industry", "sourceName", "applyStartDate", "applyEndDate", "graduateRequirement",
    "applyUrl", "originalUrl", "publishStatus", "lifecycle", "manualLock",
  ];
  const vals: Record<string, unknown> = {
    sourceKey,
    sourceLabel: body.source_label ?? body.sourceLabel ?? null,
    companyName: body.company_name ?? body.companyName ?? null,
    companyType: body.company_type ?? body.companyType ?? null,
    recruitType: body.recruit_type ?? body.recruitType ?? null,
    city: body.city ?? null,
    jobTitle: body.job_title ?? body.jobTitle ?? null,
    industry: body.industry ?? null,
    sourceName: body.source_name ?? body.sourceName ?? null,
    applyStartDate: body.apply_start_date ?? body.applyStartDate ?? null,
    applyEndDate: body.apply_end_date ?? body.applyEndDate ?? null,
    graduateRequirement: body.graduate_requirement ?? body.graduateRequirement ?? null,
    applyUrl: body.apply_url ?? body.applyUrl ?? null,
    originalUrl: body.original_url ?? body.originalUrl ?? null,
    publishStatus: body.publish_status ?? body.publishStatus ?? "draft",
    lifecycle: body.lifecycle ?? "active",
    manualLock: !!body.manual_lock || !!body.manualLock,
    createdAt: now,
    updatedAt: now,
  };
  try {
    const [inserted] = await db.insert(campusJobs).values(vals).returning({ id: campusJobs.id });
    return ok({ id: inserted!.id });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
