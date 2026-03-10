"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type DocRow = {
  id: number;
  title: string;
  industry: string | null;
  price: string;
  previewPages: number;
  saleCount: number;
  status: string;
  updatedAt: string | null;
};

export default function AdminDocsPage() {
  const [list, setList] = useState<DocRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (keyword) params.set("keyword", keyword);
    if (status) params.set("status", status);
    fetch(`/api/admin/docs?${params}`)
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
  }, [page, keyword, status]);

  const setDocStatus = (id: number, newStatus: string) => {
    fetch(`/api/admin/docs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) load();
      });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">面试资料管理</h1>
      <p className="mt-2 text-slate-600">M5.1 列表、编辑、上架/下架。</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="标题"
          className="rounded border border-slate-300 px-2 py-1 text-sm w-40"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已上架</option>
          <option value="unpublished">已下架</option>
        </select>
        <button type="button" onClick={() => setPage(1)} className="rounded bg-primary px-3 py-1 text-sm text-white">查询</button>
        <Link href="/admin/docs/new" className="rounded border border-slate-300 px-3 py-1 text-sm">新增资料</Link>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无资料</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>标题</Th>
                <Th>行业</Th>
                <Th>价格</Th>
                <Th>预览页</Th>
                <Th>销量</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td className="max-w-xs truncate">{row.title}</Td>
                    <Td>{row.industry ?? "—"}</Td>
                    <Td>¥{row.price}</Td>
                    <Td>{row.previewPages}</Td>
                    <Td>{row.saleCount}</Td>
                    <Td>{row.status === "published" ? "已上架" : row.status === "unpublished" ? "已下架" : "草稿"}</Td>
                    <Td>
                      <Link href={`/admin/docs/${row.id}/edit`} className="text-primary underline mr-2">编辑</Link>
                      {row.status === "published" ? (
                        <button type="button" onClick={() => setDocStatus(row.id, "unpublished")} className="text-amber-600 underline">下架</button>
                      ) : (
                        <button type="button" onClick={() => setDocStatus(row.id, "published")} className="text-green-600 underline">上架</button>
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
              <button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 disabled:opacity-50">下一页</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
