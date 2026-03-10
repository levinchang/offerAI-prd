"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type UserRow = {
  id: number;
  nickname: string | null;
  createdAt: string;
  utmSource: string | null;
  campusExpireAt: string | null;
  civilExpireAt: string | null;
  totalPayAmount: string;
};

export default function AdminUsersPage() {
  const [list, setList] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (keyword) params.set("keyword", keyword);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setList(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, keyword]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">用户列表</h1>
      <p className="mt-2 text-slate-600">用户与注册来源。</p>
      <div className="mt-4 flex items-center gap-3">
        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="昵称" className="rounded border border-slate-300 px-2 py-1 text-sm w-40" />
        <button type="button" onClick={() => setPage(1)} className="rounded bg-primary px-3 py-1 text-sm text-white">查询</button>
      </div>
      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无用户</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>昵称</Th>
                <Th>来源</Th>
                <Th>校招到期</Th>
                <Th>事业编到期</Th>
                <Th>消费（元）</Th>
                <Th>注册时间</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td>{row.nickname ?? "—"}</Td>
                    <Td>{row.utmSource ?? "—"}</Td>
                    <Td className="text-sm">{row.campusExpireAt ?? "—"}</Td>
                    <Td className="text-sm">{row.civilExpireAt ?? "—"}</Td>
                    <Td>{row.totalPayAmount ?? "0"}</Td>
                    <Td className="text-sm">{row.createdAt?.slice(0, 19)}</Td>
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
