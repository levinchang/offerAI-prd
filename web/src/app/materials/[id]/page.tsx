"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Doc = {
  id: number;
  title: string;
  description: string | null;
  industry: string | null;
  companyTags: string | null;
  price: string;
  previewPages: number;
  fileKey: string | null;
  hasAccess: boolean;
};

type PreviewRes = {
  previewPages: number | null;
  hasAccess: boolean;
  previewUrl: string | null;
  fullUrl: string | null;
  message: string;
};

export default function MaterialDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [doc, setDoc] = useState<Doc | null>(null);
  const [preview, setPreview] = useState<PreviewRes | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/docs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setDoc(d.data);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/docs/${id}/preview`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setPreview(d.data);
      });
  }, [id]);

  if (!doc) return <main className="min-h-screen p-6"><p className="text-slate-500">加载中…</p></main>;

  const showPreviewUrl = preview?.hasAccess ? preview.fullUrl : preview?.previewUrl;
  const isPlaceholderUrl = showPreviewUrl != null && (showPreviewUrl.startsWith("docs/") || !showPreviewUrl.startsWith("http"));

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <Link href="/materials" className="text-sm text-primary hover:underline">← 资料列表</Link>
      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">{doc.title}</h1>
        {(doc.industry || doc.companyTags) && (
          <p className="mt-2 text-sm text-slate-500">{[doc.industry, doc.companyTags].filter(Boolean).join(" · ")}</p>
        )}
        {doc.description && <p className="mt-4 text-slate-700">{doc.description}</p>}
        <p className="mt-4 font-medium text-primary">¥{doc.price}</p>
        <p className="mt-2 text-sm text-slate-500">
          {preview?.hasAccess ? "您已购买，可阅读全文。" : `免费预览前 ${doc.previewPages} 页，购买后解锁全文。`}
        </p>

        {/* 预览区：有可访问 URL 且为真实链接时用 iframe，否则占位说明 */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 min-h-[240px]">
          {showPreviewUrl && !isPlaceholderUrl ? (
            <iframe src={showPreviewUrl} title="资料预览" className="w-full h-[360px] rounded border-0" />
          ) : doc.fileKey ? (
            <p className="text-sm text-slate-500">预览功能需接入 OSS 后生效，当前为占位。</p>
          ) : (
            <p className="text-sm text-slate-500">暂无预览资源。</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {doc.hasAccess ? (
            <>
              {preview?.fullUrl && !isPlaceholderUrl && (
                <a
                  href={preview.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
                >
                  查看全文
                </a>
              )}
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={async () => {
                  const r = await fetch(`/api/docs/${id}/download`);
                  const d = await r.json();
                  if (d.code === 0 && d.data?.url) window.open(d.data.url, "_blank");
                  else alert(d.message || "获取下载链接失败");
                }}
              >
                下载
              </button>
              {(!preview?.fullUrl || isPlaceholderUrl) && (
                <span className="rounded-lg bg-green-100 px-4 py-2 text-sm text-green-800">您已购买，可阅读全文</span>
              )}
            </>
          ) : (
            <Link
              href={`/pricing/checkout?doc_id=${doc.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
            >
              购买解锁
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}
