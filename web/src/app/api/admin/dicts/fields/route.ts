import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { dictFields } from "../../../../../../../drizzle/schema";

/** 后台字典字段列表 */
export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const rows = await db.select().from(dictFields);
  return ok(rows);
}
