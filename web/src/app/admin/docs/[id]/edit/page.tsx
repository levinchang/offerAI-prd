"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Doc = {
  id: number;
  title: string;
  description: string | null;
  industry: string | null;
  jobType: string | null;
  companyTags: string | null;
  price: string;
  previewPages: number;
  fileKey: string | null;
  sourceDocUrl: string | null;
  status: string;
};

type DictItem = { code: string | null; label: string };

export default function AdminDocsEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [doc, setDoc] = useState<Doc | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dictIndustry, setDictIndustry] = useState<DictItem[]>([]);
  const [dictPosition, setDictPosition] = useState<DictItem[]>([]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/docs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setDoc(d.data);
      });
  }, [id]);

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
    if (!doc) return;
    setSaving(true);
    fetch(`/api/admin/docs/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        title: doc.title,
        description: doc.description,
        industry: doc.industry,
        job_type: doc.jobType,
        company_tags: doc.companyTags,
        price: doc.price,
        preview_pages: doc.previewPages,
        file_key: doc.fileKey,
        source_doc_url: doc.sourceDocUrl,
        status: doc.status,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) alert("保存成功");
      })
      .finally(() => setSaving(false));
  };

  if (!doc) return <div className="p-6">加载中…</div>;

  return (
    <div>
      <Link href="/admin/docs" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">编辑资料 #{doc.id}</h1>
      <div className="mt-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">标题</label>
          <input type="text" value={doc.title} onChange={(e) => setDoc((d) => (d ? { ...d, title: e.target.value } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">简介</label>
          <textarea value={doc.description ?? ""} onChange={(e) => setDoc((d) => (d ? { ...d, description: e.target.value || null } : d))} rows={3} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">行业</label>
          <select value={doc.industry ?? ""} onChange={(e) => setDoc((d) => (d ? { ...d, industry: e.target.value || null } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">请选择</option>
            {dictIndustry.map((o) => (
              <option key={o.code ?? o.label} value={o.code ?? o.label}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">岗位</label>
          <select value={doc.jobType ?? ""} onChange={(e) => setDoc((d) => (d ? { ...d, jobType: e.target.value || null } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
            <option value="">请选择</option>
            {dictPosition.map((o) => (
              <option key={o.code ?? o.label} value={o.code ?? o.label}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">企业标签</label>
          <input type="text" value={doc.companyTags ?? ""} onChange={(e) => setDoc((d) => (d ? { ...d, companyTags: e.target.value || null } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">价格（元）</label>
          <input type="number" min={0} step={0.01} value={doc.price} onChange={(e) => setDoc((d) => (d ? { ...d, price: e.target.value } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">预览页数</label>
          <input type="number" min={1} max={20} value={doc.previewPages} onChange={(e) => setDoc((d) => (d ? { ...d, previewPages: Number(e.target.value) || 3 } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" />
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
                if (d.code === 0 && d.data?.file_key) setDoc((prev) => (prev ? { ...prev, fileKey: d.data.file_key } : prev));
                else alert(d.message || "上传失败");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          {doc.fileKey && <p className="mt-1 text-sm text-slate-500">当前 key: {doc.fileKey}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">状态</label>
          <select value={doc.status} onChange={(e) => setDoc((d) => (d ? { ...d, status: e.target.value } : d))} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm">
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
