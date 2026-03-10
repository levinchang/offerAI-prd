"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type JobRow = {
  id: number;
  jobTitle: string | null;
  companyName: string | null;
  city: string | null;
  industry: string | null;
  publishStatus: string;
  lifecycle: string;
  applyEndDate: string | null;
  updatedAt: string | null;
};

export default function AdminJobsPage() {
  const [list, setList] = useState<JobRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (keyword) params.set("keyword", keyword);
    if (publishStatus) params.set("publishStatus", publishStatus);
    fetch(`/api/admin/jobs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setList(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page, keyword, publishStatus]);

  const setStatus = (id: number, publishStatus: string, lifecycle: string) => {
    fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishStatus, lifecycle }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) load();
      });
  };

  const deleteOne = (id: number, title: string | null) => {
    if (!confirm(`确定删除「${title ?? id}」？`)) return;
    fetch(`/api/admin/jobs/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) load();
      });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">校招岗位管理</h1>
      <p className="mt-2 text-slate-600">列表、上架/下架、删除、编辑。</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="关键词"
          className="rounded border border-slate-300 px-2 py-1 text-sm w-40"
        />
        <select
          value={publishStatus}
          onChange={(e) => setPublishStatus(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <button
          type="button"
          onClick={() => setPage(1)}
          className="rounded bg-primary px-3 py-1 text-sm text-white"
        >
          查询
        </button>
        <Link href="/admin/jobs/new" className="rounded border border-slate-300 px-3 py-1 text-sm">新增</Link>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无数据</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>岗位/公司</Th>
                <Th>城市/行业</Th>
                <Th>状态</Th>
                <Th>截止</Th>
                <Th>更新</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td className="max-w-xs truncate">{row.jobTitle ?? "—"} / {row.companyName ?? "—"}</Td>
                    <Td>{row.city ?? "—"} / {row.industry ?? "—"}</Td>
                    <Td>
                      <span className="text-sm">{row.publishStatus} / {row.lifecycle}</span>
                    </Td>
                    <Td className="text-sm">{row.applyEndDate ?? "—"}</Td>
                    <Td className="text-sm">{row.updatedAt?.slice(0, 10) ?? "—"}</Td>
                    <Td>
                      <Link
                        href={`/admin/jobs/${row.id}/edit`}
                        className="text-primary underline mr-2"
                      >
                        编辑
                      </Link>
                      {row.publishStatus === "published" && row.lifecycle === "active" ? (
                        <button
                          type="button"
                          onClick={() => setStatus(row.id, "published", "inactive")}
                          className="text-amber-600 underline mr-2"
                        >
                          下架
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(row.id, "published", "active")}
                          className="text-green-600 underline mr-2"
                        >
                          上架
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteOne(row.id, row.jobTitle)}
                        className="text-red-600 underline"
                      >
                        删除
                      </button>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>共 {total} 条</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-2 py-1 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                type="button"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-2 py-1 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
