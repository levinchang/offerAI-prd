/**
 * 飞书开放平台 API：tenant_access_token、多维表格 records 拉取。
 * 文档：https://open.feishu.cn/document/server-docs/bitable-v1/app/record/list
 */

const FEISHU_BASE = "https://open.feishu.cn/open-apis";

export type TenantTokenResult = { tenant_access_token: string; expire: number };

/** 获取 tenant_access_token（应用维度） */
export async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = (await res.json()) as { code?: number; msg?: string; tenant_access_token?: string };
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(data.msg ?? "获取 tenant_access_token 失败");
  }
  return data.tenant_access_token;
}

export type BitableRecord = { record_id: string; fields: Record<string, unknown> };

export type ListRecordsResult = {
  has_more: boolean;
  page_token?: string;
  total?: number;
  items?: BitableRecord[];
};

/** 拉取多维表格记录（分页） */
export async function listBitableRecords(
  tenantToken: string,
  appToken: string,
  tableId: string,
  options: { pageSize?: number; pageToken?: string; viewId?: string } = {}
): Promise<ListRecordsResult> {
  const params = new URLSearchParams();
  if (options.pageSize) params.set("page_size", String(Math.min(500, options.pageSize)));
  if (options.pageToken) params.set("page_token", options.pageToken);
  if (options.viewId) params.set("view_id", options.viewId);

  const url = `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tenantToken}` },
  });
  const data = (await res.json()) as {
    code?: number;
    msg?: string;
    data?: { has_more?: boolean; page_token?: string; total?: number; items?: BitableRecord[] };
  };
  if (data.code !== 0) {
    throw new Error(data.msg ?? "拉取多维表格记录失败");
  }
  const d = data.data ?? {};
  return {
    has_more: !!d.has_more,
    page_token: d.page_token,
    total: d.total,
    items: d.items ?? [],
  };
}
