"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Sku = {
  id: number;
  name: string;
  type: string;
  durationDays: number;
  listPrice: string;
  promoPrice: string | null;
};

type Doc = {
  id: number;
  title: string;
  price: string;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const skuId = searchParams?.get("sku_id");
  const docId = searchParams?.get("doc_id");
  const [sku, setSku] = useState<Sku | null>(null);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (skuId) {
      fetch("/api/skus")
        .then((r) => r.json())
        .then((d) => {
          if (d.code === 0 && Array.isArray(d.data)) {
            const found = d.data.find((s: { id: number }) => s.id === Number(skuId));
            setSku(found ?? null);
          }
        });
    }
    if (docId) {
      fetch(`/api/docs/${docId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.code === 0 && d.data) setDoc({ id: d.data.id, title: d.data.title, price: d.data.price });
        });
    }
  }, [skuId, docId]);

  const handleOrder = () => {
    setSubmitting(true);
    const body = docId ? { doc_id: Number(docId) } : { sku_id: Number(skuId) };
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.order_no) {
          window.location.href = `/pay/result?order_no=${d.data.order_no}`;
        } else {
          alert(d.message || "下单失败，请先登录");
        }
      })
      .finally(() => setSubmitting(false));
  };

  if (!skuId && !docId) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto">
        <p className="text-slate-600">请选择套餐或资料</p>
        <Link href="/pricing" className="mt-4 inline-block text-primary underline">返回套餐页</Link>
        <Link href="/materials" className="mt-2 ml-4 inline-block text-primary underline">面试资料</Link>
      </main>
    );
  }

  if (docId && !doc) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto">
        <p className="text-slate-600">加载中…</p>
      </main>
    );
  }

  if (skuId && !sku) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto">
        <p className="text-slate-600">加载中…</p>
      </main>
    );
  }

  if (doc) {
    return (
      <main className="min-h-screen p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-slate-800">确认订单</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <p className="font-medium text-slate-900">{doc.title}</p>
          <p className="mt-1 text-sm text-slate-500">面试资料</p>
          <p className="mt-4 text-lg font-semibold text-slate-900">¥{doc.price}</p>
          <p className="mt-6 text-xs text-slate-400">支付方式：占位（正式接入微信/支付宝后生效）</p>
          <button
            type="button"
            onClick={handleOrder}
            disabled={submitting}
            className="mt-6 w-full rounded-lg bg-primary py-3 text-white disabled:opacity-50"
          >
            {submitting ? "提交中…" : "确认下单"}
          </button>
        </div>
        <Link href={`/materials/${doc.id}`} className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-700">返回资料详情</Link>
      </main>
    );
  }

  const amount = sku!.promoPrice != null ? sku!.promoPrice : sku!.listPrice;

  return (
    <main className="min-h-screen p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-slate-800">确认订单</h1>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <p className="font-medium text-slate-900">{sku!.name}</p>
        <p className="mt-1 text-sm text-slate-500">有效期 {sku!.durationDays} 天</p>
        <p className="mt-4 text-lg font-semibold text-slate-900">¥{amount}</p>
        <p className="mt-6 text-xs text-slate-400">支付方式：占位（正式接入微信/支付宝后生效）</p>
        <button
          type="button"
          onClick={handleOrder}
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-primary py-3 text-white disabled:opacity-50"
        >
          {submitting ? "提交中…" : "确认下单"}
        </button>
      </div>
      <Link href="/pricing" className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-700">返回套餐页</Link>
    </main>
  );
}
