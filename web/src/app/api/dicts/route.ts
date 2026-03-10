import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { dictItems } from "../../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * M8.1 校招表字典：按 field_key 返回启用枚举项，按 sort_order 排序。
 * 支持多 key：?field_key=recruit_type&field_key=industry
 */
export async function GET(req: NextRequest) {
  const keys = req.nextUrl.searchParams.getAll("field_key");
  if (keys.length === 0) return fail(ErrorCodes.BAD_REQUEST, "缺少 field_key");
  try {
    const uniqueKeys = [...new Set(keys)];
    const all = await Promise.all(
      uniqueKeys.map(async (fieldKey) => {
        const rows = await db
          .select()
          .from(dictItems)
          .where(
            and(
              eq(dictItems.fieldKey, fieldKey),
              eq(dictItems.status, "active")
            )
          )
          .orderBy(asc(dictItems.sortOrder));
        return { fieldKey, items: rows };
      })
    );
    const byKey = Object.fromEntries(all.map(({ fieldKey, items }) => [fieldKey, items]));
    return ok(keys.length === 1 ? { items: byKey[keys[0]!] ?? [] } : byKey);
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
