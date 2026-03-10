import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { dictItems } from "../../../../../../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

/** 后台字典枚举项列表：按 field_key */
export async function GET(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const fieldKey = req.nextUrl.searchParams.get("field_key")?.trim();
  if (!fieldKey) return fail(ErrorCodes.BAD_REQUEST, "缺少 field_key");
  const rows = await db.select().from(dictItems).where(eq(dictItems.fieldKey, fieldKey)).orderBy(asc(dictItems.sortOrder));
  return ok(rows);
}

/** 后台新增枚举项 */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const fieldKey = body.field_key ?? body.fieldKey;
  const label = body.label;
  const code = body.code ?? body.label;
  if (!fieldKey || !label) return fail(ErrorCodes.BAD_REQUEST, "缺少 field_key 或 label");
  const now = new Date();
  const [inserted] = await db
    .insert(dictItems)
    .values({
      fieldKey,
      code: code ?? null,
      label: String(label).trim(),
      sortOrder: Number(body.sort_order ?? body.sortOrder) || 0,
      status: body.status === "inactive" ? "inactive" : "active",
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: dictItems.id });
  return ok({ id: inserted!.id });
}
