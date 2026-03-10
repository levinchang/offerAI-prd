"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: number;
  orderNo: string;
  productType: string;
  orderStatus: string;
  payAmount: string;
  createdAt: string;
};

export default function MeOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [needLogin, setNeedLogin] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setNeedLogin(!!d.data.needLogin);
          setOrders(d.data.orders ?? []);
        }
      });
  }, []);

  if (needLogin) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <p className="text-slate-600">请先登录</p>
        <Link href="/me" className="mt-4 inline-block text-primary underline">
          返回个人中心
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/me" className="text-slate-500 hover:text-slate-700">
          ← 个人中心
        </Link>
        <h1 className="text-xl font-semibold text-slate-800">订单列表</h1>
      </div>
      {orders.length === 0 ? (
        <p className="mt-6 text-slate-500">暂无订单</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-lg border border-slate-200 bg-white p-4 text-sm"
            >
              <div className="flex justify-between">
                <span className="text-slate-600">{o.orderNo}</span>
                <span
                  className={
                    o.orderStatus === "paid"
                      ? "text-green-600"
                      : "text-slate-500"
                  }
                >
                  {o.orderStatus === "paid" ? "已支付" : o.orderStatus}
                </span>
              </div>
              <div className="mt-1 flex justify-between text-slate-700">
                <span>{o.productType === "campus" ? "校招会员" : o.productType}</span>
                <span>¥{o.payAmount}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{o.createdAt}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
