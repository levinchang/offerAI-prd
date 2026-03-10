"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Sku = {
  id: number;
  skuCode: string;
  name: string;
  type: string;
  durationDays: number;
  listPrice: string;
  promoPrice: string | null;
};

export default function PricingPage() {
  const [list, setList] = useState<Sku[]>([]);

  useEffect(() => {
    fetch("/api/skus")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && Array.isArray(d.data)) setList(d.data);
      });
  }, []);

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-slate-800">套餐与定价</h1>
      <p className="mt-2 text-slate-600">选择套餐，开通后解锁校招/事业编权益。</p>

      {list.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm text-slate-500">暂无在售套餐</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((sku) => (
            <div
              key={sku.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-medium text-slate-900">{sku.name}</h2>
              <p className="mt-2 text-sm text-slate-500">有效期 {sku.durationDays} 天</p>
              <p className="mt-4">
                {sku.promoPrice != null ? (
                  <>
                    <span className="text-2xl font-semibold text-primary">¥{sku.promoPrice}</span>
                    <span className="ml-2 text-sm text-slate-400 line-through">¥{sku.listPrice}</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-slate-900">¥{sku.listPrice}</span>
                )}
              </p>
              <Link
                href={`/pricing/checkout?sku_id=${sku.id}`}
                className="mt-6 block rounded-lg bg-primary py-2 text-center text-sm font-medium text-white hover:opacity-90"
              >
                立即开通
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
