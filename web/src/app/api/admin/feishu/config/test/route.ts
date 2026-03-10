import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { feishuSyncConfigs } from "../../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * 测试飞书连接：用当前配置拉取 1 条记录。
 * 未接入飞书 API 时：仅校验 app_id、table_id 已填即返回成功（占位）。
 */
export async function POST(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const dataType = body.data_type ?? body.dataType;
  if (dataType !== "campus" && dataType !== "civil") return fail(ErrorCodes.BAD_REQUEST, "data_type 须为 campus 或 civil");

  const [config] = await db.select().from(feishuSyncConfigs).where(eq(feishuSyncConfigs.dataType, dataType)).limit(1);
  if (!config) return fail(ErrorCodes.NOT_FOUND, "配置不存在");
  if (!config.appId?.trim()) return fail(ErrorCodes.BAD_REQUEST, "请先填写飞书 App ID");
  if (!config.tableId?.trim()) return fail(ErrorCodes.BAD_REQUEST, "请先填写飞书表格 ID");

  // 占位：未接入飞书开放平台时仅做必填校验，返回成功
  // 正式接入：取 tenant_access_token（app_id + app_secret），请求 bitable records 拉 1 条
  return ok({ success: true, message: "连接成功（占位校验通过，接入飞书 API 后将真实请求）" });
}
