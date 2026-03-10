"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Sku = {
  id: number;
  skuCode: string;
  name: string;
  type: string;
  durationDays: number;
  listPrice: string;
  promoPrice: string | null;
  showInFront: boolean;
  status: string;
};

export default function AdminSkuEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [sku, setSku] = useState<Sku | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/skus/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setSku(d.data);
      });
  }, [id]);

  const handleSave = () => {
    if (!sku) return;
    setSaving(true);
    fetch(`/api/admin/skus/${sku.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: sku.name,
        type: sku.type,
        durationDays: sku.durationDays,
        list_price: sku.listPrice,
        promo_price: sku.promoPrice || null,
        show_in_front: sku.showInFront,
        status: sku.status,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) alert("保存成功");
      })
      .finally(() => setSaving(false));
  };

  if (!sku) return <div className="p-6">加载中…</div>;

  return (
    <div>
      <Link href="/admin/skus" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">编辑 SKU #{sku.id}</h1>
      <div className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">编码（只读）</label>
          <input type="text" value={sku.skuCode} readOnly className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">名称</label>
          <input
            type="text"
            value={sku.name}
            onChange={(e) => setSku((s) => (s ? { ...s, name: e.target.value } : s))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">类型</label>
          <select
            value={sku.type}
            onChange={(e) => setSku((s) => (s ? { ...s, type: e.target.value } : s))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="campus">校招</option>
            <option value="civil">事业编</option>
            <option value="all">全站</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">有效期（天）</label>
          <input
            type="number"
            min={1}
            value={sku.durationDays}
            onChange={(e) => setSku((s) => (s ? { ...s, durationDays: Number(e.target.value) || 1 } : s))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">原价（元）</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={sku.listPrice}
            onChange={(e) => setSku((s) => (s ? { ...s, listPrice: e.target.value } : s))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">促销价（元，可选）</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={sku.promoPrice ?? ""}
            onChange={(e) => setSku((s) => (s ? { ...s, promoPrice: e.target.value || null } : s))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sku.showInFront}
              onChange={(e) => setSku((s) => (s ? { ...s, showInFront: e.target.checked } : s))}
            />
            在前台套餐页展示
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">状态</label>
          <select
            value={sku.status}
            onChange={(e) => setSku((s) => (s ? { ...s, status: e.target.value } : s))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="inactive">下架</option>
            <option value="active">上架</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
          <Link href="/admin/skus" className="rounded border border-slate-300 px-4 py-2 text-sm">取消</Link>
        </div>
      </div>
    </div>
  );
}
