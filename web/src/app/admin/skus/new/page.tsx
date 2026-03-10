"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminSkuNewPage() {
  const router = useRouter();
  const [skuCode, setSkuCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("campus");
  const [durationDays, setDurationDays] = useState(365);
  const [listPrice, setListPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [showInFront, setShowInFront] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!skuCode.trim() || !name.trim()) {
      alert("请填写编码和名称");
      return;
    }
    const list = Number(listPrice);
    if (Number.isNaN(list) || list < 0) {
      alert("原价无效");
      return;
    }
    setSaving(true);
    fetch("/api/admin/skus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku_code: skuCode.trim(),
        name: name.trim(),
        type,
        duration_days: durationDays,
        list_price: list,
        promo_price: promoPrice ? Number(promoPrice) : null,
        show_in_front: showInFront,
        status: "inactive",
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.id) {
          router.push(`/admin/skus/${d.data.id}/edit`);
        } else {
          alert(d.message || "创建失败");
        }
      })
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <Link href="/admin/skus" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">新增 SKU</h1>
      <div className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">编码（唯一）</label>
          <input
            type="text"
            value={skuCode}
            onChange={(e) => setSkuCode(e.target.value)}
            placeholder="如 SKU_CAMPUS_YEAR"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如 校招会员-1年"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">类型</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
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
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">原价（元）</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={listPrice}
            onChange={(e) => setListPrice(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">促销价（元，可选）</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={promoPrice}
            onChange={(e) => setPromoPrice(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showInFront} onChange={(e) => setShowInFront(e.target.checked)} />
            在前台套餐页展示
          </label>
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
