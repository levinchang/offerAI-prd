import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { docs } from "../../../../../../drizzle/schema";
import { eq, desc, and, count, ilike } from "drizzle-orm";

/** 后台：资料列表，分页、按标题/行业/状态筛选 */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const keyword = searchParams.get("keyword")?.trim();
  const industry = searchParams.get("industry")?.trim();
  const status = searchParams.get("status")?.trim();

  const conditions = [];
  if (keyword) conditions.push(ilike(docs.title, `%${keyword}%`));
  if (industry) conditions.push(eq(docs.industry, industry));
  if (status) conditions.push(eq(docs.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  try {
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(docs)
        .where(where)
        .orderBy(desc(docs.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      where ? db.select({ total: count() }).from(docs).where(where) : db.select({ total: count() }).from(docs),
    ]);
    return ok({ list: rows, total: Number(countResult[0]?.total ?? 0), page, pageSize });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}

/** 后台：新增资料 */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const {
    title,
    description,
    industry,
    job_type: jobType,
    company_tags: companyTags,
    price,
    preview_pages: previewPages = 3,
    file_key: fileKey,
    source_doc_url: sourceDocUrl,
    status = "draft",
  } = body as Record<string, unknown>;
  if (!title || typeof title !== "string" || !title.trim()) return fail(ErrorCodes.BAD_REQUEST, "缺少 title");
  const p = Number(price);
  if (Number.isNaN(p) || p < 0) return fail(ErrorCodes.BAD_REQUEST, "price 无效");
  const now = new Date();
  try {
    const [inserted] = await db
      .insert(docs)
      .values({
        title: (title as string).trim(),
        description: description != null ? String(description) : null,
        industry: industry != null ? String(industry) : null,
        jobType: jobType != null ? String(jobType) : null,
        companyTags: companyTags != null ? String(companyTags) : null,
        price: String(p),
        previewPages: Math.min(20, Math.max(1, Number(previewPages) || 3)),
        fileKey: fileKey != null ? String(fileKey) : null,
        sourceDocUrl: sourceDocUrl != null ? String(sourceDocUrl) : null,
        status: status === "published" ? "published" : status === "unpublished" ? "unpublished" : "draft",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: docs.id });
    return ok({ id: inserted!.id });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
