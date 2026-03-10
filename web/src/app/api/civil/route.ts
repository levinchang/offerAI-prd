import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import {
  civilPosts,
  favorites,
  applyRecords,
} from "../../../../drizzle/schema";
import { eq, and, count, desc, or, inArray, ilike, gte, lte, sql } from "drizzle-orm";

const PUBLISHED = "published";
const ACTIVE = "active";

/**
 * 事业编岗位列表：分页、筛选（省/类型/学历/截止/关键词）、仅看收藏、求职进度。
 * 会员才返回 originalUrl。
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const keyword = searchParams.get("keyword")?.trim();
  const provinces = searchParams.get("province")?.split(",").filter(Boolean) ?? [];
  const postTypes = searchParams.get("postType")?.split(",").filter(Boolean) ?? [];
  const education = searchParams.get("education")?.trim() || null;
  const endBefore = searchParams.get("endBefore")?.trim() || null; // 截止日期 <= endBefore
  const endAfter = searchParams.get("endAfter")?.trim() || null;   // 截止日期 >= endAfter
  const onlyFavorites = searchParams.get("only_favorites") === "1";
  const stage = searchParams.get("stage")?.trim() || null;

  const { userId, isCivilMember } = await getSession();

  const conditions = [
    eq(civilPosts.publishStatus, PUBLISHED),
    eq(civilPosts.lifecycle, ACTIVE),
  ];

  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(
        ilike(civilPosts.title, pattern),
        ilike(civilPosts.detail, pattern),
        ilike(civilPosts.positionsText, pattern)
      )!
    );
  }
  if (provinces.length > 0) conditions.push(inArray(civilPosts.province, provinces));
  if (postTypes.length > 0) conditions.push(inArray(civilPosts.postType, postTypes));
  if (education) conditions.push(ilike(civilPosts.educationRequirement, `%${education}%`));
  if (endBefore) conditions.push(lte(civilPosts.applyEndDate, endBefore));
  if (endAfter) conditions.push(gte(civilPosts.applyEndDate, endAfter));

  if (onlyFavorites && userId) {
    const favRows = await db
      .select({ targetId: favorites.targetId })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.targetType, "civil")
        )
      );
    const favIds = favRows.map((r) => Number(r.targetId));
    if (favIds.length === 0) {
      return ok({ list: [], total: 0, page, pageSize, favoriteIds: [], applyRecordMap: {} });
    }
    conditions.push(inArray(civilPosts.id, favIds));
  }

  if (stage && userId) {
    const recordRows = await db
      .select({ civilPostId: applyRecords.civilPostId })
      .from(applyRecords)
      .where(
        and(
          eq(applyRecords.userId, userId),
          eq(applyRecords.sourceType, "civil"),
          eq(applyRecords.stage, stage)
        )
      );
    const postIds = recordRows
      .map((r) => r.civilPostId)
      .filter((id): id is number => id != null);
    if (postIds.length === 0) {
      return ok({ list: [], total: 0, page, pageSize, favoriteIds: [], applyRecordMap: {} });
    }
    conditions.push(inArray(civilPosts.id, postIds));
  }

  const where = and(...conditions);

  try {
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(civilPosts)
        .where(where)
        .orderBy(desc(civilPosts.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(civilPosts).where(where),
    ]);
    const total = countResult[0]?.total ?? 0;
    const postIdsInPage = rows.map((r) => r.id);

    let favoriteIds: number[] = [];
    let applyRecordMap: Record<number, { id: number; stage: string; remark: string | null }> = {};
    if (userId && postIdsInPage.length > 0) {
      const [favList, recordList] = await Promise.all([
        db
          .select({ targetId: favorites.targetId })
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.targetType, "civil"),
              inArray(favorites.targetId, postIdsInPage)
            )
          ),
        db
          .select({
            id: applyRecords.id,
            civilPostId: applyRecords.civilPostId,
            stage: applyRecords.stage,
            remark: applyRecords.remark,
          })
          .from(applyRecords)
          .where(
            and(
              eq(applyRecords.userId, userId),
              eq(applyRecords.sourceType, "civil"),
              inArray(applyRecords.civilPostId, postIdsInPage)
            )
          ),
      ]);
      favoriteIds = favList.map((r) => Number(r.targetId));
      applyRecordMap = Object.fromEntries(
        recordList
          .filter((r) => r.civilPostId != null)
          .map((r) => [
            r.civilPostId!,
            {
              id: r.id,
              stage: r.stage,
              remark: r.remark ?? null,
            },
          ])
      );
    }

    const list = rows.map((row) => ({
      ...row,
      originalUrl: isCivilMember ? row.originalUrl : null,
    }));

    return ok({
      list,
      total: Number(total),
      page,
      pageSize,
      favoriteIds,
      applyRecordMap,
      isCivilMember: !!isCivilMember,
    });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
