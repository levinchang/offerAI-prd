"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Order = {
  id: number;
  orderNo: string;
  productType: string;
  orderStatus: string;
  payAmount: string;
  paidAt: string | null;
};

export default function PayResultPage() {
  const searchParams = useSearchParams();
  const orderNo = searchParams?.get("order_no");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNo) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders?order_no=${encodeURIComponent(orderNo)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.order) setOrder(d.data.order);
      })
      .finally(() => setLoading(false));
  }, [orderNo]);

  if (!orderNo) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto">
        <p className="text-slate-600">缺少订单号</p>
        <Link href="/pricing" className="mt-4 inline-block text-primary underline">返回套餐页</Link>
      </main>
    );
  }

  if (loading) return <main className="min-h-screen p-6 max-w-lg mx-auto"><p className="text-slate-600">加载中…</p></main>;
  if (!order) return <main className="min-h-screen p-6 max-w-lg mx-auto"><p className="text-slate-600">订单不存在或请先登录</p><Link href="/me" className="mt-4 inline-block text-primary underline">个人中心</Link></main>;

  const paid = order.orderStatus === "paid";

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-slate-800">{paid ? "支付成功" : "待支付"}</h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-slate-600">订单号：{order.orderNo}</p>
        <p className="mt-2 text-slate-600">金额：¥{order.payAmount}</p>
        <p className="mt-2 text-slate-600">状态：{paid ? "已支付" : order.orderStatus}</p>
        {paid && (
          <p className="mt-4 text-sm text-green-600">
            权益已发放，您可在个人中心查看校招/事业编会员到期时间。
          </p>
        )}
        {!paid && (
          <p className="mt-4 text-xs text-slate-400">
            开发环境可点击下方「模拟支付成功」完成权益发放。
          </p>
        )}
      </div>
      {!paid && (
        <button
          type="button"
          onClick={() => {
            fetch("/api/pay/notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_no: order.orderNo }),
            })
              .then((r) => r.json())
              .then((d) => { if (d.code === 0) window.location.reload(); });
          }}
          className="mt-4 rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800"
        >
          模拟支付成功
        </button>
      )}
      <div className="mt-6 flex gap-4">
        <Link href="/me" className="rounded-lg bg-primary px-4 py-2 text-sm text-white">个人中心</Link>
        <Link href="/pricing" className="rounded border border-slate-300 px-4 py-2 text-sm">继续购买</Link>
      </div>
    </main>
  );
}
