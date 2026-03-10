"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type MemberRow = {
  id: number;
  nickname: string | null;
  createdAt: string;
  campusExpireAt: string | null;
  civilExpireAt: string | null;
};

export default function AdminMembersPage() {
  const [list, setList] = useState<MemberRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState<{ userId: number; type: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/members?page=${page}&pageSize=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setList(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleExtend = (userId: number, memberType: string) => {
    const days = prompt("延长天数（默认 30）", "30");
    if (days == null) return;
    const d = Math.max(1, parseInt(days, 10) || 30);
    setExtending({ userId, type: memberType });
    fetch("/api/admin/members/extend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, member_type: memberType, days: d }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.code === 0) load();
        else alert(res.message || "延长失败");
      })
      .finally(() => setExtending(null));
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">会员管理</h1>
      <p className="mt-2 text-slate-600">用户校招/事业编到期与手动延长。</p>
      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无用户</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>用户ID</Th>
                <Th>昵称</Th>
                <Th>校招到期</Th>
                <Th>事业编到期</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td>{row.nickname ?? "—"}</Td>
                    <Td>{row.campusExpireAt ?? "未开通"}</Td>
                    <Td>{row.civilExpireAt ?? "未开通"}</Td>
                    <Td>
                      <button type="button" disabled={!!extending} onClick={() => handleExtend(row.id, "campus")} className="text-primary underline mr-2">延长校招</button>
                      <button type="button" disabled={!!extending} onClick={() => handleExtend(row.id, "civil")} className="text-primary underline">延长事业编</button>
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
