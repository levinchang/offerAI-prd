"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DictItem = { code: string | null; label: string };

export default function AdminDocsNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobType, setJobType] = useState("");
  const [companyTags, setCompanyTags] = useState("");
  const [price, setPrice] = useState("9.9");
  const [previewPages, setPreviewPages] = useState(3);
  const [fileKey, setFileKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [dictIndustry, setDictIndustry] = useState<DictItem[]>([]);
  const [dictPosition, setDictPosition] = useState<DictItem[]>([]);

  useEffect(() => {
    fetch("/api/dicts?field_key=doc_industry&field_key=doc_position")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          const data = d.data as Record<string, { code: string | null; label: string }[]>;
          setDictIndustry(data.doc_industry ?? []);
          setDictPosition(data.doc_position ?? []);
        }
      });
  }, []);

  const handleSave = () => {
    if (!title.trim()) {
      alert("请填写标题");
      return;
    }
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) {
      alert("价格无效");
      return;
    }
    setSaving(true);
    fetch("/api/admin/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        industry: industry.trim() || null,
        job_type: jobType.trim() || null,
        company_tags: companyTags.trim() || null,
        price: p,
        preview_pages: previewPages,
        file_key: fileKey.trim() || null,
        status,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.id) router.push(`/admin/docs/${d.data.id}/edit`);
        else alert(d.message || "创建失败");
      })
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <Link href="/admin/docs" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">新增资料</h1>
      <div className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">标题</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">简介</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">行业</label>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">请选择</option>
            {dictIndustry.map((o) => (
              <option key={o.code ?? o.label} value={o.code ?? o.label}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">岗位</label>
          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">请选择</option>
            {dictPosition.map((o) => (
              <option key={o.code ?? o.label} value={o.code ?? o.label}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">企业标签</label>
          <input type="text" value={companyTags} onChange={(e) => setCompanyTags(e.target.value)} placeholder="逗号分隔" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">价格（元）</label>
          <input type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">预览页数</label>
          <input type="number" min={1} max={20} value={previewPages} onChange={(e) => setPreviewPages(Number(e.target.value) || 3)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">PDF 文件（≤20MB）</label>
          <input
            type="file"
            accept="application/pdf"
            className="mt-1 text-sm"
            disabled={uploading}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 20 * 1024 * 1024) {
                alert("请上传 PDF 文件，且不超过 20MB");
                return;
              }
              setUploading(true);
              const form = new FormData();
              form.append("file", f);
              try {
                const r = await fetch("/api/admin/docs/upload", { method: "POST", body: form });
                const d = await r.json();
                if (d.code === 0 && d.data?.file_key) setFileKey(d.data.file_key);
                else alert(d.message || "上传失败");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          {fileKey && <p className="mt-1 text-sm text-slate-500">已上传，key: {fileKey}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">状态</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="draft">草稿</option>
            <option value="published">已上架</option>
            <option value="unpublished">已下架</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleSave} disabled={saving} className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? "保存中…" : "保存"}</button>
          <Link href="/admin/docs" className="rounded border border-slate-300 px-4 py-2 text-sm">取消</Link>
        </div>
      </div>
    </div>
  );
}
