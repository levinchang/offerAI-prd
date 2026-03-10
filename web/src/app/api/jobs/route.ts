import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import {
  campusJobs,
  favorites,
  applyRecords,
} from "../../../../drizzle/schema";
import { eq, and, count, desc, or, inArray, ilike } from "drizzle-orm";

const PUBLISHED = "published";
const ACTIVE = "active";

/**
 * 校招岗位列表（分页、筛选、仅看收藏、求职进度）。
 * 查询参数：page, pageSize, keyword, recruitType, industry, city, companyType,
 * only_favorites, stage（需登录；会员才返回 applyUrl/originalUrl）
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const keyword = searchParams.get("keyword")?.trim();
  const recruitTypes = searchParams.get("recruitType")?.split(",").filter(Boolean) ?? [];
  const industries = searchParams.get("industry")?.split(",").filter(Boolean) ?? [];
  const cities = searchParams.get("city")?.split(",").filter(Boolean) ?? [];
  const companyTypes = searchParams.get("companyType")?.split(",").filter(Boolean) ?? [];
  const onlyFavorites = searchParams.get("only_favorites") === "1";
  const stage = searchParams.get("stage")?.trim() || null;

  const { userId, isCampusMember } = await getSession();

  const conditions = [
    eq(campusJobs.publishStatus, PUBLISHED),
    eq(campusJobs.lifecycle, ACTIVE),
  ];
  if (keyword) {
    const pattern = `%${keyword}%`;
    conditions.push(
      or(
        ilike(campusJobs.companyName, pattern),
        ilike(campusJobs.jobTitle, pattern)
      )!
    );
  }
  if (recruitTypes.length > 0) conditions.push(inArray(campusJobs.recruitType, recruitTypes));
  if (industries.length > 0) conditions.push(inArray(campusJobs.industry, industries));
  if (cities.length > 0) conditions.push(inArray(campusJobs.city, cities));
  if (companyTypes.length > 0) conditions.push(inArray(campusJobs.companyType, companyTypes));

  if (onlyFavorites && userId) {
    const favRows = await db
      .select({ targetId: favorites.targetId })
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.targetType, "campus")
        )
      );
    const favIds = favRows.map((r) => Number(r.targetId));
    if (favIds.length === 0) {
      return ok({ list: [], total: 0, page, pageSize, favoriteIds: [], applyRecordMap: {} });
    }
    conditions.push(inArray(campusJobs.id, favIds));
  }

  if (stage && userId) {
    const recordRows = await db
      .select({ campusJobId: applyRecords.campusJobId })
      .from(applyRecords)
      .where(
        and(
          eq(applyRecords.userId, userId),
          eq(applyRecords.sourceType, "campus"),
          eq(applyRecords.stage, stage)
        )
      );
    const jobIds = recordRows
      .map((r) => r.campusJobId)
      .filter((id): id is number => id != null);
    if (jobIds.length === 0) {
      return ok({ list: [], total: 0, page, pageSize, favoriteIds: [], applyRecordMap: {} });
    }
    conditions.push(inArray(campusJobs.id, jobIds));
  }

  const where = and(...conditions);
  try {
    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(campusJobs)
        .where(where)
        .orderBy(desc(campusJobs.updatedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(campusJobs).where(where),
    ]);
    const total = countResult[0]?.total ?? 0;
    const jobIdsInPage = rows.map((r) => r.id);

    let favoriteIds: number[] = [];
    let applyRecordMap: Record<number, { stage: string; remark: string | null }> = {};
    if (userId && jobIdsInPage.length > 0) {
      const [favList, recordList] = await Promise.all([
        db
          .select({ targetId: favorites.targetId })
          .from(favorites)
          .where(
            and(
              eq(favorites.userId, userId),
              eq(favorites.targetType, "campus"),
              inArray(favorites.targetId, jobIdsInPage)
            )
          ),
        db
          .select({
            id: applyRecords.id,
            campusJobId: applyRecords.campusJobId,
            stage: applyRecords.stage,
            remark: applyRecords.remark,
          })
          .from(applyRecords)
          .where(
            and(
              eq(applyRecords.userId, userId),
              eq(applyRecords.sourceType, "campus"),
              inArray(applyRecords.campusJobId, jobIdsInPage)
            )
          ),
      ]);
      favoriteIds = favList.map((r) => Number(r.targetId));
      applyRecordMap = Object.fromEntries(
        recordList
          .filter((r) => r.campusJobId != null)
          .map((r) => [
            r.campusJobId,
            {
              id: r.id,
              stage: r.stage,
              remark: r.remark ?? null,
            },
          ])
      );
    }

    const list = rows.map((row) => {
      const base = {
        ...row,
        applyUrl: isCampusMember ? row.applyUrl : null,
        originalUrl: isCampusMember ? row.originalUrl : null,
      };
      return base;
    });

    return ok({
      list,
      total: Number(total),
      page,
      pageSize,
      favoriteIds,
      applyRecordMap,
      isCampusMember: !!isCampusMember,
    });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
