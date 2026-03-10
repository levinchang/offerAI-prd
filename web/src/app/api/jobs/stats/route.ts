import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { campusJobs } from "../../../../../drizzle/schema";
import { eq, and, count, sql, gte } from "drizzle-orm";

const PUBLISHED = "published";
const ACTIVE = "active";
const baseWhere = and(
  eq(campusJobs.publishStatus, PUBLISHED),
  eq(campusJobs.lifecycle, ACTIVE)
);

/**
 * F3.1 校招页 24h 统计
 * 返回：24h新增、今日截止、7日更新、30日更新、累计职位数、日常实习在招
 */
export async function GET() {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const ts24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ts7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ts30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [new24h, dueToday, updated7d, updated30d, total, intern] = await Promise.all([
      db
        .select({ count: count() })
        .from(campusJobs)
        .where(
          and(
            baseWhere,
            gte(campusJobs.createdAt, ts24h)
          )
        ),
      db
        .select({ count: count() })
        .from(campusJobs)
        .where(
          and(
            baseWhere,
            sql`${campusJobs.applyEndDate} = current_date`
          )
        ),
      db
        .select({ count: count() })
        .from(campusJobs)
        .where(
          and(baseWhere, gte(campusJobs.updatedAt, ts7d))
        ),
      db
        .select({ count: count() })
        .from(campusJobs)
        .where(
          and(baseWhere, gte(campusJobs.updatedAt, ts30d))
        ),
      db.select({ count: count() }).from(campusJobs).where(baseWhere),
      db
        .select({ count: count() })
        .from(campusJobs)
        .where(
          and(
            baseWhere,
            sql`${campusJobs.recruitType} LIKE '%日常实习%'`
          )
        ),
    ]);

    const data = {
      new24h: Number(new24h[0]?.count ?? 0),
      dueToday: Number(dueToday[0]?.count ?? 0),
      updated7d: Number(updated7d[0]?.count ?? 0),
      updated30d: Number(updated30d[0]?.count ?? 0),
      total: Number(total[0]?.count ?? 0),
      intern: Number(intern[0]?.count ?? 0),
      updateDate: today,
    };
    return ok(data);
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
