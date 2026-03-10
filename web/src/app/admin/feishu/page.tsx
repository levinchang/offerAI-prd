"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type Config = {
  id: number;
  dataType: string;
  appId: string | null;
  tableId: string | null;
  viewId: string | null;
  fieldMapping: string | null;
  syncIntervalMinutes: number;
  autoSyncEnabled: boolean;
  lastSyncAt: string | null;
};

type Task = {
  id: number;
  dataType: string;
  triggerType: string;
  status: string;
  insertCount: number;
  updateCount: number;
  skipCount: number;
  failCount: number;
  failReason: string | null;
  startedAt: string;
  finishedAt: string | null;
};

export default function AdminFeishuPage() {
  const [tab, setTab] = useState<"config" | "tasks">("config");
  const [configs, setConfigs] = useState<Config[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncScope, setSyncScope] = useState<"campus" | "civil" | "all">("all");
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [testModal, setTestModal] = useState<{ dataType: string; loading: boolean; result: string | null } | null>(null);

  const loadConfigs = () => {
    fetch("/api/admin/feishu/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && Array.isArray(d.data)) setConfigs(d.data);
      });
  };

  const loadTasks = () => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    fetch(`/api/admin/feishu/tasks?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setTasks(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
        }
      });
  };

  useEffect(() => {
    if (tab === "config") loadConfigs();
    else loadTasks();
  }, [tab, page]);

  const handleSync = () => {
    setSyncing(true);
    fetch("/api/admin/feishu/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_type: syncScope }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) {
          setTab("tasks");
          setPage(1);
          loadTasks();
        } else alert(d.message || "创建任务失败");
      })
      .finally(() => setSyncing(false));
  };

  const handleRetry = (id: number) => {
    fetch(`/api/admin/feishu/tasks/${id}/retry`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) loadTasks();
        else alert(d.message || "重试失败");
      });
  };

  const openTestModal = (dataType: string) => {
    setTestModal({ dataType, loading: true, result: null });
    fetch("/api/admin/feishu/config/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data_type: dataType }),
    })
      .then((r) => r.json())
      .then((d) => {
        setTestModal((m) => m ? { ...m, loading: false, result: d.code === 0 ? (d.data?.message ?? "连接成功") : (d.message || "连接失败") } : null);
      })
      .catch(() => setTestModal((m) => m ? { ...m, loading: false, result: "请求异常" } : null));
  };

  const saveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;
    const form = e.target as HTMLFormElement;
    const body: Record<string, unknown> = {
      data_type: editingConfig.dataType,
      app_id: (form.querySelector("[name=app_id]") as HTMLInputElement)?.value?.trim() || undefined,
      app_secret: (form.querySelector("[name=app_secret]") as HTMLInputElement)?.value?.trim() || undefined,
      app_token: (form.querySelector("[name=app_token]") as HTMLInputElement)?.value?.trim() || undefined,
      table_id: (form.querySelector("[name=table_id]") as HTMLInputElement)?.value?.trim() || undefined,
      view_id: (form.querySelector("[name=view_id]") as HTMLInputElement)?.value?.trim() || undefined,
      field_mapping: (form.querySelector("[name=field_mapping]") as HTMLTextAreaElement)?.value?.trim() || undefined,
      sync_interval_minutes: Number((form.querySelector("[name=sync_interval_minutes]") as HTMLInputElement)?.value) || 60,
      auto_sync_enabled: (form.querySelector("[name=auto_sync_enabled]") as HTMLInputElement)?.checked ?? true,
    };
    fetch("/api/admin/feishu/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) {
          setEditingConfig(null);
          loadConfigs();
        } else alert(d.message || "保存失败");
      });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">飞书同步</h1>
      <p className="mt-2 text-slate-600">配置与任务列表（M2）；同步逻辑占位，接入飞书 API 后生效。</p>

      <div className="mt-4 flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("config")}
          className={`px-3 py-2 text-sm ${tab === "config" ? "border-b-2 border-primary text-primary" : "text-slate-600"}`}
        >
          配置
        </button>
        <button
          type="button"
          onClick={() => setTab("tasks")}
          className={`px-3 py-2 text-sm ${tab === "tasks" ? "border-b-2 border-primary text-primary" : "text-slate-600"}`}
        >
          任务
        </button>
      </div>

      {tab === "config" && (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>数据类型</Th>
                <Th>表格ID</Th>
                <Th>同步间隔(分)</Th>
                <Th>自动同步</Th>
                <Th>上次同步</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {configs.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <Td>{c.dataType === "campus" ? "校招" : "事业编"}</Td>
                    <Td>{c.tableId ?? "—"}</Td>
                    <Td>{c.syncIntervalMinutes}</Td>
                    <Td>{c.autoSyncEnabled ? "开" : "关"}</Td>
                    <Td className="text-sm">{c.lastSyncAt?.slice(0, 19) ?? "—"}</Td>
                    <Td>
                      <button type="button" onClick={() => setEditingConfig(c)} className="text-primary underline mr-2">编辑</button>
                      <button type="button" onClick={() => openTestModal(c.dataType)} className="text-primary underline">测试连接</button>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <>
          <div className="mt-4 flex items-center gap-3">
            <select
              value={syncScope}
              onChange={(e) => setSyncScope(e.target.value as "campus" | "civil" | "all")}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="all">全部</option>
              <option value="campus">校招</option>
              <option value="civil">事业编</option>
            </select>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="rounded bg-primary px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              {syncing ? "创建中…" : "手动同步"}
            </button>
          </div>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>数据类型</Th>
                <Th>触发</Th>
                <Th>状态</Th>
                <Th>新增/更新/跳过/失败</Th>
                <Th>开始</Th>
                <Th>完成</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <Td>{t.id}</Td>
                    <Td>{t.dataType === "campus" ? "校招" : "事业编"}</Td>
                    <Td>{t.triggerType === "manual" ? "手动" : "自动"}</Td>
                    <Td>{t.status}</Td>
                    <Td className="text-sm">{t.insertCount} / {t.updateCount} / {t.skipCount} / {t.failCount}</Td>
                    <Td className="text-sm">{t.startedAt?.slice(0, 19) ?? "—"}</Td>
                    <Td className="text-sm">{t.finishedAt?.slice(0, 19) ?? "—"}</Td>
                    <Td>
                      <button type="button" onClick={() => setTaskDetail(t)} className="text-primary underline mr-2">详情</button>
                      {t.status === "failed" && (
                        <button type="button" onClick={() => handleRetry(t.id)} className="text-amber-600 underline">重试</button>
                      )}
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
          {total > 20 && (
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-2 py-1 text-sm disabled:opacity-50">上一页</button>
              <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 text-sm disabled:opacity-50">下一页</button>
            </div>
          )}
        </>
      )}

      {taskDetail && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40" onClick={() => setTaskDetail(null)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium text-slate-800">任务详情 #{taskDetail.id}</h3>
            <pre className="mt-4 text-sm text-slate-600 whitespace-pre-wrap">
              {JSON.stringify(taskDetail, null, 2)}
            </pre>
            <button type="button" onClick={() => setTaskDetail(null)} className="mt-4 rounded border px-3 py-1 text-sm">关闭</button>
          </div>
        </div>
      )}

      {editingConfig && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40" onClick={() => setEditingConfig(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-6 shadow" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium text-slate-800">编辑配置 - {editingConfig.dataType === "campus" ? "校招" : "事业编"}</h3>
            <form onSubmit={saveConfig} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-700">App ID</label>
                <input name="app_id" type="text" defaultValue={editingConfig.appId ?? ""} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" placeholder="飞书应用 App ID" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">App Secret</label>
                <input name="app_secret" type="password" className="mt-1 w-full rounded border px-2 py-1.5 text-sm" placeholder="留空则不修改" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">App Token（可选）</label>
                <input name="app_token" type="password" className="mt-1 w-full rounded border px-2 py-1.5 text-sm" placeholder="留空则不修改" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">表格 ID</label>
                <input name="table_id" type="text" defaultValue={editingConfig.tableId ?? ""} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" placeholder="飞书多维表格 ID" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">视图 ID（可选）</label>
                <input name="view_id" type="text" defaultValue={editingConfig.viewId ?? ""} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">字段映射 JSON</label>
                <textarea name="field_mapping" rows={8} defaultValue={editingConfig.fieldMapping ?? ""} className="mt-1 w-full rounded border px-2 py-1.5 text-sm font-mono" placeholder='{"列名":"字段名"}' />
              </div>
              <div>
                <label className="block text-sm text-slate-700">同步间隔（分钟）</label>
                <input name="sync_interval_minutes" type="number" min={5} max={1440} defaultValue={editingConfig.syncIntervalMinutes} className="mt-1 w-full rounded border px-2 py-1.5 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input name="auto_sync_enabled" type="checkbox" defaultChecked={editingConfig.autoSyncEnabled} className="rounded" />
                <label className="text-sm text-slate-700">自动同步</label>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="rounded bg-primary px-3 py-1.5 text-sm text-white">保存</button>
                <button type="button" onClick={() => setEditingConfig(null)} className="rounded border px-3 py-1.5 text-sm">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {testModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40" onClick={() => setTestModal(null)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-medium text-slate-800">测试连接 - {testModal.dataType === "campus" ? "校招" : "事业编"}</h3>
            <div className="mt-4 text-sm text-slate-600">
              {testModal.loading ? "正在连接…" : testModal.result}
            </div>
            <button type="button" onClick={() => setTestModal(null)} className="mt-4 rounded border px-3 py-1 text-sm">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
