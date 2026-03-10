import { NextRequest } from "next/server";
import { ok, fail, ErrorCodes } from "@/lib/api-response";
import { getAdminId } from "@/lib/admin-session";
import { db } from "@/lib/db";
import { feishuSyncConfigs } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

const CAMPUS_DEFAULT_MAPPING = JSON.stringify({
  企业名称: "company_name",
  招聘岗位: "job_title",
  工作城市: "city",
  企业类型: "company_type",
  招聘类型: "recruit_type",
  所属行业: "industry",
  网申开始日期: "apply_start_date",
  网申截止日期: "apply_end_date",
  毕业生要求: "graduate_requirement",
  投递链接: "apply_url",
  原文链接: "original_url",
}, null, 2);

const CIVIL_DEFAULT_MAPPING = JSON.stringify({
  公告标题: "title",
  省份: "province",
  区域: "region",
  类型: "post_type",
  报名开始日期: "apply_start_date",
  报名截止日期: "apply_end_date",
  招聘人数: "recruit_count",
  职位数量: "position_count",
  公告详情: "detail",
  报考学历要求: "education_requirement",
  报考年龄要求: "age_requirement",
  具体岗位: "positions_text",
  原文链接: "original_url",
}, null, 2);

/** 获取飞书同步配置列表（保证 campus + civil 各一条） */
export async function GET() {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const configs = await db.select().from(feishuSyncConfigs);
  const hasCampus = configs.some((c) => c.dataType === "campus");
  const hasCivil = configs.some((c) => c.dataType === "civil");
  const now = new Date();
  if (!hasCampus) {
    await db.insert(feishuSyncConfigs).values({
      dataType: "campus",
      syncIntervalMinutes: 60,
      autoSyncEnabled: true,
      fieldMapping: CAMPUS_DEFAULT_MAPPING,
      createdAt: now,
      updatedAt: now,
    });
  }
  if (!hasCivil) {
    await db.insert(feishuSyncConfigs).values({
      dataType: "civil",
      syncIntervalMinutes: 60,
      autoSyncEnabled: true,
      fieldMapping: CIVIL_DEFAULT_MAPPING,
      createdAt: now,
      updatedAt: now,
    });
  }
  const list = await db.select().from(feishuSyncConfigs);
  return ok(list.map((c) => ({
    ...c,
    appSecret: c.appSecret ? "***" : null,
    appToken: c.appToken ? "***" : null,
  })));
}

/** 更新一条配置（按 data_type） */
export async function PATCH(req: NextRequest) {
  const adminId = await getAdminId();
  if (!adminId) return fail(ErrorCodes.UNAUTHORIZED, "请先登录");
  const body = await req.json().catch(() => ({}));
  const dataType = body.data_type ?? body.dataType;
  if (dataType !== "campus" && dataType !== "civil") return fail(ErrorCodes.BAD_REQUEST, "data_type 须为 campus 或 civil");

  const [row] = await db.select().from(feishuSyncConfigs).where(eq(feishuSyncConfigs.dataType, dataType)).limit(1);
  if (!row) return fail(ErrorCodes.NOT_FOUND, "配置不存在");

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.app_id !== undefined) updates.appId = body.app_id;
  if (body.app_secret !== undefined && String(body.app_secret).trim() !== "") updates.appSecret = body.app_secret;
  if (body.app_token !== undefined && String(body.app_token).trim() !== "") updates.appToken = body.app_token;
  if (body.table_id !== undefined) updates.tableId = body.table_id;
  if (body.view_id !== undefined) updates.viewId = body.view_id;
  if (body.field_mapping !== undefined) updates.fieldMapping = typeof body.field_mapping === "string" ? body.field_mapping : JSON.stringify(body.field_mapping);
  if (body.sync_interval_minutes !== undefined) {
    const v = Number(body.sync_interval_minutes);
    if (v >= 5 && v <= 1440) updates.syncIntervalMinutes = v;
  }
  if (body.auto_sync_enabled !== undefined) updates.autoSyncEnabled = !!body.auto_sync_enabled;

  await db.update(feishuSyncConfigs).set(updates).where(eq(feishuSyncConfigs.id, row.id));
  return ok({ ok: true });
}
