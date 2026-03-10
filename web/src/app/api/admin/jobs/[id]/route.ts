import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { campusJobs } from "../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 后台：获取单条校招岗位 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId < 1) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(campusJobs).where(eq(campusJobs.id, jobId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");
  return ok(row);
}

/** 后台：更新校招岗位 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId < 1) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(campusJobs).where(eq(campusJobs.id, jobId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allow = [
    "sourceLabel", "companyName", "companyType", "recruitType", "city", "jobTitle",
    "industry", "sourceName", "applyStartDate", "applyEndDate", "graduateRequirement",
    "applyUrl", "originalUrl", "publishStatus", "lifecycle", "manualLock",
  ];
  for (const key of allow) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  const snake: Record<string, string> = {
    source_label: "sourceLabel", source_name: "sourceName", company_name: "companyName",
    company_type: "companyType", recruit_type: "recruitType", job_title: "jobTitle",
    apply_start_date: "applyStartDate", apply_end_date: "applyEndDate",
    graduate_requirement: "graduateRequirement", apply_url: "applyUrl", original_url: "originalUrl",
    publish_status: "publishStatus", manual_lock: "manualLock",
  };
  for (const [sk, ck] of Object.entries(snake)) {
    if (body[sk] !== undefined) updates[ck] = body[sk];
  }
  await db.update(campusJobs).set(updates).where(eq(campusJobs.id, jobId));
  return ok({ ok: true });
}

/** 后台：删除校招岗位 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId) || jobId < 1) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  await db.delete(campusJobs).where(eq(campusJobs.id, jobId));
  return ok({ ok: true });
}
