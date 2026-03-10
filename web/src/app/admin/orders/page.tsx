"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type OrderRow = {
  id: number;
  orderNo: string;
  userId: number;
  productType: string;
  productId: number;
  payAmount: string;
  orderStatus: string;
  createdAt: string;
  paidAt: string | null;
  nickname: string | null;
};

export default function AdminOrdersPage() {
  const [list, setList] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [orderStatus, setOrderStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (orderStatus) params.set("orderStatus", orderStatus);
    fetch(`/api/admin/orders?${params}`)
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
  }, [page, orderStatus]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">订单管理</h1>
      <p className="mt-2 text-slate-600">订单列表与状态。</p>
      <div className="mt-4 flex items-center gap-3">
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付</option>
        </select>
        <button type="button" onClick={() => setPage(1)} className="rounded bg-primary px-3 py-1 text-sm text-white">查询</button>
      </div>
      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无订单</p>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <Table>
              <TableHead>
                <Th>ID</Th>
                <Th>订单号</Th>
                <Th>用户</Th>
                <Th>商品类型</Th>
                <Th>金额</Th>
                <Th>状态</Th>
                <Th>创建时间</Th>
                <Th>支付时间</Th>
              </TableHead>
              <TableBody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <Td>{row.id}</Td>
                    <Td>{row.orderNo}</Td>
                    <Td>{row.nickname ?? row.userId}</Td>
                    <Td>{row.productType}</Td>
                    <Td>¥{row.payAmount}</Td>
                    <Td>{row.orderStatus}</Td>
                    <Td className="text-sm">{row.createdAt?.slice(0, 19)}</Td>
                    <Td className="text-sm">{row.paidAt?.slice(0, 19) ?? "—"}</Td>
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
