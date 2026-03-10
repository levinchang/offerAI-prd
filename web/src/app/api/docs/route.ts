import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { docs } from "../../../../drizzle/schema";
import { eq, and, desc, ilike, count } from "drizzle-orm";

/** C 端：资料列表，仅已发布，分页、行业/关键词筛选 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const keyword = searchParams.get("keyword")?.trim();
  const industry = searchParams.get("industry")?.trim();

  const conditions = [eq(docs.status, "published")];
  if (keyword) conditions.push(ilike(docs.title, `%${keyword}%`));
  if (industry) conditions.push(eq(docs.industry, industry));
  const where = and(...conditions);

  try {
    const rows = await db
      .select({
        id: docs.id,
        title: docs.title,
        description: docs.description,
        industry: docs.industry,
        companyTags: docs.companyTags,
        price: docs.price,
        previewPages: docs.previewPages,
        saleCount: docs.saleCount,
      })
      .from(docs)
      .where(where)
      .orderBy(desc(docs.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    const [countRes] = await db.select({ total: count() }).from(docs).where(where);
    const total = Number(countRes?.total ?? 0);
    return ok({ list: rows, total, page, pageSize });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
