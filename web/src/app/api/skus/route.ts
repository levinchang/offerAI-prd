import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { db } from "@/lib/db";
import { skus } from "../../../../drizzle/schema";
import { eq, and, asc } from "drizzle-orm";

/** C 端：仅返回上架且 show_in_front 的 SKU，供套餐页使用 */
export async function GET() {
  try {
    const rows = await db
      .select({
        id: skus.id,
        skuCode: skus.skuCode,
        name: skus.name,
        type: skus.type,
        durationDays: skus.durationDays,
        listPrice: skus.listPrice,
        promoPrice: skus.promoPrice,
      })
      .from(skus)
      .where(and(eq(skus.status, "active"), eq(skus.showInFront, true)))
      .orderBy(asc(skus.id));
    return ok(rows);
  } catch (e) {
    return fail(ErrorCodes.INTERNAL, (e as Error).message);
  }
}
