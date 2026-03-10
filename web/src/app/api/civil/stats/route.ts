import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { civilPosts } from "../../../../../drizzle/schema";
import { eq, and, count } from "drizzle-orm";

const PUBLISHED = "published";
const ACTIVE = "active";

/** 事业编岗位数量，供首页数据概览使用 */
export async function GET() {
  try {
    const [r] = await db
      .select({ count: count() })
      .from(civilPosts)
      .where(
        and(
          eq(civilPosts.publishStatus, PUBLISHED),
          eq(civilPosts.lifecycle, ACTIVE)
        )
      );
    return ok({ total: Number(r?.count ?? 0) });
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
