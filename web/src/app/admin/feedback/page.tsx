"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type FeedbackRow = {
  id: number;
  userId: number;
  type: string | null;
  content: string | null;
  status: string;
  createdAt: string;
};

export default function AdminFeedbackPage() {
  const [list, setList] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (status) params.set("status", status);
    fetch(`/api/admin/feedback?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setList(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, status]);

  const setProcessed = (id: number) => {
    fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "processed" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.code === 0) load(); });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">反馈处理</h1>
      <p className="mt-2 text-slate-600">用户反馈列表与处理状态。</p>
      <div className="mt-4 flex items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-sm">
          <option value="">全部</option>
          <option value="pending">待处理</option>
          <option value="processed">已处理</option>
        </select>
        <button type="button" onClick={() => setPage(1)} className="rounded bg-primary px-3 py-1 text-sm text-white">查询</button>
      </div>
      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无反馈</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>用户ID</Th>
                <Th>类型</Th>
                <Th>内容</Th>
                <Th>状态</Th>
                <Th>时间</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td>{row.userId}</Td>
                    <Td>{row.type ?? "—"}</Td>
                    <Td className="max-w-xs truncate">{row.content ?? "—"}</Td>
                    <Td>{row.status}</Td>
                    <Td className="text-sm">{row.createdAt?.slice(0, 19)}</Td>
                    <Td>
                      {row.status === "pending" && (
                        <button type="button" onClick={() => setProcessed(row.id)} className="text-primary underline">标记已处理</button>
                      )}
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>共 {total} 条</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-2 py-1 disabled:opacity-50">上一页</button>
              <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 disabled:opacity-50">下一页</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
