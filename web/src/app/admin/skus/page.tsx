"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type SkuRow = {
  id: number;
  skuCode: string;
  name: string;
  type: string;
  durationDays: number;
  listPrice: string;
  promoPrice: string | null;
  showInFront: boolean;
  status: string;
  updatedAt: string | null;
};

export default function AdminSkusPage() {
  const [list, setList] = useState<SkuRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    fetch(`/api/admin/skus?${params}`)
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
  }, [page, type, status]);

  const setSkuStatus = (id: number, newStatus: string) => {
    fetch(`/api/admin/skus/${id}`, {
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
      <h1 className="text-xl font-semibold text-slate-800">会员商品与定价</h1>
      <p className="mt-2 text-slate-600">M6.3 商品与定价：列表、编辑、上架/下架。</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">全部类型</option>
          <option value="campus">校招</option>
          <option value="civil">事业编</option>
          <option value="all">全站</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">全部状态</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
        </select>
        <button type="button" onClick={() => setPage(1)} className="rounded bg-primary px-3 py-1 text-sm text-white">
          查询
        </button>
        <Link href="/admin/skus/new" className="rounded border border-slate-300 px-3 py-1 text-sm">
          新增 SKU
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无 SKU，请先新增。</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>编码</Th>
                <Th>名称</Th>
                <Th>类型</Th>
                <Th>有效期(天)</Th>
                <Th>原价</Th>
                <Th>促销价</Th>
                <Th>前台展示</Th>
                <Th>状态</Th>
                <Th>操作</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td>{row.skuCode}</Td>
                    <Td>{row.name}</Td>
                    <Td>{row.type}</Td>
                    <Td>{row.durationDays}</Td>
                    <Td>¥{row.listPrice}</Td>
                    <Td>{row.promoPrice != null ? `¥${row.promoPrice}` : "—"}</Td>
                    <Td>{row.showInFront ? "是" : "否"}</Td>
                    <Td>{row.status === "active" ? "上架" : "下架"}</Td>
                    <Td>
                      <Link href={`/admin/skus/${row.id}/edit`} className="text-primary underline mr-2">
                        编辑
                      </Link>
                      {row.status === "active" ? (
                        <button
                          type="button"
                          onClick={() => setSkuStatus(row.id, "inactive")}
                          className="text-amber-600 underline"
                        >
                          下架
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSkuStatus(row.id, "active")}
                          className="text-green-600 underline"
                        >
                          上架
                        </button>
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
