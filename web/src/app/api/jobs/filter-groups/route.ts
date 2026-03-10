import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getUserId } from "@/lib/session";
import { db } from "@/lib/db";
import { jobFilterGroups } from "../../../../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

export type FilterGroupPayload = {
  keyword?: string;
  recruitType?: string[];
  industry?: string[];
  city?: string[];
  companyType?: string[];
};

/** GET：当前用户的校招筛选分组列表 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const rows = await db
    .select()
    .from(jobFilterGroups)
    .where(eq(jobFilterGroups.userId, userId))
    .orderBy(asc(jobFilterGroups.sortOrder), asc(jobFilterGroups.createdAt));
  return ok({
    list: rows.map((r) => ({
      id: r.id,
      name: r.name,
      filtersJson: r.filtersJson,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt,
    })),
  });
}

/** POST：保存当前筛选为分组 */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const { name, filters } = body as { name?: string; filters?: FilterGroupPayload };
  if (!name?.trim()) return fail(ErrorCodes.BAD_REQUEST, "分组名称必填");
  const filtersJson = JSON.stringify(filters ?? {});
  const now = new Date();
  const [inserted] = await db
    .insert(jobFilterGroups)
    .values({
      userId,
      name: name.trim(),
      filtersJson,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: jobFilterGroups.id, name: jobFilterGroups.name });
  return ok(inserted!);
}
