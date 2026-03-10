import { db } from "@/lib/db";
import { syncTasks, feishuSyncConfigs, campusJobs, civilPosts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getTenantAccessToken, listBitableRecords, type BitableRecord } from "./feishu-api";

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapFieldsToRow(
  fields: Record<string, unknown>,
  fieldMapping: Record<string, string>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [feishuKey, sysKey] of Object.entries(fieldMapping)) {
    const v = fields[feishuKey];
    if (v === undefined || v === null) continue;
    const camel = snakeToCamel(sysKey);
    if (typeof v === "object" && v !== null && "text" in (v as Record<string, unknown>)) {
      row[camel] = (v as { text?: string }).text ?? String(v);
    } else {
      row[camel] = typeof v === "string" ? v.trim() : String(v);
    }
  }
  return row;
}

function toDateValue(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v).toISOString().slice(0, 10);
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function toIntValue(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** 执行单次同步：拉取飞书多维表格，按 source_key upsert，manual_lock/人工 跳过 */
export async function runSyncTask(taskId: number): Promise<void> {
  const [task] = await db.select().from(syncTasks).where(eq(syncTasks.id, taskId)).limit(1);
  if (!task || task.status !== "running") return;

  const dataTypes: ("campus" | "civil")[] =
    task.dataType === "campus" || task.dataType === "civil" ? [task.dataType] : ["campus", "civil"];

  let insertCount = 0;
  let updateCount = 0;
  let skipCount = 0;
  let failCount = 0;
  const failReasons: string[] = [];
  const now = new Date();

  try {
    for (const dataType of dataTypes) {
      const [config] = await db
        .select()
        .from(feishuSyncConfigs)
        .where(eq(feishuSyncConfigs.dataType, dataType))
        .limit(1);
      if (!config?.appId || !config?.tableId) {
        skipCount += 1;
        continue;
      }
      if (!config.appSecret?.trim()) {
        failReasons.push(`配置 ${dataType} 缺少 app_secret`);
        failCount += 1;
        continue;
      }

      let tenantToken: string;
      try {
        tenantToken = await getTenantAccessToken(config.appId, config.appSecret);
      } catch (e) {
        failReasons.push(`获取 token 失败: ${(e as Error).message}`);
        failCount += 1;
        continue;
      }

      const appToken = config.appToken?.trim();
      if (!appToken) {
        failReasons.push("未配置飞书多维表格 app_token（表格文档 token）");
        failCount += 1;
        continue;
      }
      const mapping = (() => {
        try {
          return config.fieldMapping ? (JSON.parse(config.fieldMapping) as Record<string, string>) : {};
        } catch {
          return {};
        }
      })();

      let pageToken: string | undefined;
      do {
        const result = await listBitableRecords(tenantToken, appToken, config.tableId!, {
          pageSize: 100,
          pageToken,
          viewId: config.viewId ?? undefined,
        });
        const items = result.items ?? [];
        pageToken = result.has_more ? result.page_token : undefined;

        for (const item of items) {
          try {
            const fields = (item as BitableRecord).fields ?? {};
            const row = mapFieldsToRow(fields, mapping);

            if (dataType === "campus") {
            const companyName = String(row.companyName ?? "").trim();
            const jobTitle = String(row.jobTitle ?? "").trim();
            const sourceKey = `${companyName}|${jobTitle}`.slice(0, 128) || `campus_${item.record_id}`;
            const [existing] = await db
              .select()
              .from(campusJobs)
              .where(eq(campusJobs.sourceKey, sourceKey))
              .limit(1);
            if (existing) {
              if (existing.manualLock || existing.sourceLabel === "人工增加") {
                skipCount += 1;
                continue;
              }
              const updates: Record<string, unknown> = {
                companyName: companyName || existing.companyName,
                jobTitle: jobTitle || existing.jobTitle,
                city: row.city ?? existing.city,
                companyType: row.companyType ?? existing.companyType,
                recruitType: row.recruitType ?? existing.recruitType,
                industry: row.industry ?? existing.industry,
                sourceName: row.sourceName ?? existing.sourceName,
                applyStartDate: toDateValue(row.applyStartDate) ?? existing.applyStartDate,
                applyEndDate: toDateValue(row.applyEndDate) ?? existing.applyEndDate,
                graduateRequirement: row.graduateRequirement ?? existing.graduateRequirement,
                applyUrl: row.applyUrl ?? existing.applyUrl,
                originalUrl: row.originalUrl ?? existing.originalUrl,
                updatedAt: now,
              };
              await db.update(campusJobs).set(updates).where(eq(campusJobs.id, existing.id));
              updateCount += 1;
            } else {
              await db.insert(campusJobs).values({
                sourceKey,
                sourceLabel: "飞书同步",
                companyName: companyName || null,
                jobTitle: jobTitle || null,
                city: (row.city as string) ?? null,
                companyType: (row.companyType as string) ?? null,
                recruitType: (row.recruitType as string) ?? null,
                industry: (row.industry as string) ?? null,
                sourceName: (row.sourceName as string) ?? null,
                applyStartDate: toDateValue(row.applyStartDate),
                applyEndDate: toDateValue(row.applyEndDate),
                graduateRequirement: (row.graduateRequirement as string) ?? null,
                applyUrl: (row.applyUrl as string) ?? null,
                originalUrl: (row.originalUrl as string) ?? null,
                publishStatus: "published",
                lifecycle: "active",
                createdAt: now,
                updatedAt: now,
              });
              insertCount += 1;
            }
          } else {
            const title = String(row.title ?? "").trim();
            const sourceKey = title.slice(0, 128) || `civil_${item.record_id}`;
            const [existing] = await db
              .select()
              .from(civilPosts)
              .where(eq(civilPosts.sourceKey, sourceKey))
              .limit(1);
            if (existing) {
              if (existing.manualLock || existing.sourceLabel === "人工增加") {
                skipCount += 1;
                continue;
              }
              const updates: Record<string, unknown> = {
                title: title || existing.title,
                province: row.province ?? existing.province,
                region: row.region ?? existing.region,
                postType: row.postType ?? existing.postType,
                detail: row.detail ?? existing.detail,
                applyStartDate: toDateValue(row.applyStartDate) ?? existing.applyStartDate,
                applyEndDate: toDateValue(row.applyEndDate) ?? existing.applyEndDate,
                recruitCount: toIntValue(row.recruitCount) ?? existing.recruitCount,
                positionCount: toIntValue(row.positionCount) ?? existing.positionCount,
                educationRequirement: row.educationRequirement ?? existing.educationRequirement,
                ageRequirement: row.ageRequirement ?? existing.ageRequirement,
                positionsText: row.positionsText ?? existing.positionsText,
                originalUrl: row.originalUrl ?? existing.originalUrl,
                updatedAt: now,
              };
              await db.update(civilPosts).set(updates).where(eq(civilPosts.id, existing.id));
              updateCount += 1;
            } else {
              await db.insert(civilPosts).values({
                sourceKey,
                sourceLabel: "飞书同步",
                title: title || null,
                province: (row.province as string) ?? null,
                region: (row.region as string) ?? null,
                postType: (row.postType as string) ?? null,
                detail: (row.detail as string) ?? null,
                applyStartDate: toDateValue(row.applyStartDate),
                applyEndDate: toDateValue(row.applyEndDate),
                recruitCount: toIntValue(row.recruitCount),
                positionCount: toIntValue(row.positionCount),
                educationRequirement: (row.educationRequirement as string) ?? null,
                ageRequirement: (row.ageRequirement as string) ?? null,
                positionsText: (row.positionsText as string) ?? null,
                originalUrl: (row.originalUrl as string) ?? null,
                publishStatus: "published",
                lifecycle: "active",
                createdAt: now,
                updatedAt: now,
              });
              insertCount += 1;
            }
          } catch (err) {
            failCount += 1;
            const msg = (err as Error).message?.slice(0, 200) ?? "未知错误";
            if (failReasons.length < 5) failReasons.push(msg);
          }
        }
      } while (pageToken);

      await db
        .update(feishuSyncConfigs)
        .set({ lastSyncAt: now })
        .where(eq(feishuSyncConfigs.id, config.id));
    }

    await db
      .update(syncTasks)
      .set({
        status: "success",
        insertCount,
        updateCount,
        skipCount,
        failCount,
        failReason: failReasons.length > 0 ? failReasons.slice(0, 3).join("; ") : null,
        finishedAt: now,
      })
      .where(eq(syncTasks.id, taskId));
  } catch (e) {
    await db
      .update(syncTasks)
      .set({
        status: "failed",
        failCount: failCount + 1,
        failReason: ((e as Error).message ?? "同步异常").slice(0, 2000),
        finishedAt: now,
      })
      .where(eq(syncTasks.id, taskId));
  }
}
