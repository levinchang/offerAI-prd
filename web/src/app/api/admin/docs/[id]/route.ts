import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { docs } from "../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/** 后台：获取单条资料 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(docs).where(eq(docs.id, docId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");
  return ok(row);
}

/** 后台：更新资料 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  const [row] = await db.select().from(docs).where(eq(docs.id, docId)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "记录不存在");

  const body = await req.json().catch(() => ({}));
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allow = ["title", "description", "industry", "jobType", "companyTags", "price", "previewPages", "fileKey", "sourceDocUrl", "status"];
  for (const key of allow) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.job_type !== undefined) updates.jobType = body.job_type;
  if (body.company_tags !== undefined) updates.companyTags = body.company_tags;
  if (body.file_key !== undefined) updates.fileKey = body.file_key;
  if (body.source_doc_url !== undefined) updates.sourceDocUrl = body.source_doc_url;
  if (body.preview_pages !== undefined) updates.previewPages = Math.min(20, Math.max(1, Number(body.preview_pages) || 3));

  await db.update(docs).set(updates).where(eq(docs.id, docId));
  return ok({ ok: true });
}

/** 后台：删除资料 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId)) return fail(ErrorCodes.BAD_REQUEST, "无效的 id");
  await db.delete(docs).where(eq(docs.id, docId));
  return ok({ ok: true });
}
