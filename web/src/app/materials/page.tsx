"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Doc = {
  id: number;
  title: string;
  description: string | null;
  industry: string | null;
  companyTags: string | null;
  price: string;
  previewPages: number;
  saleCount: number;
};

export default function MaterialsPage() {
  const [list, setList] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (keyword) params.set("keyword", keyword);
    fetch(`/api/docs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setList(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
        }
      })
      .finally(() => setLoading(false));
  }, [page, keyword]);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800">面试资料</h1>
      <p className="mt-2 text-slate-600">预览前 N 页后购买解锁全文。</p>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索标题"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm w-48"
        />
        <button type="button" onClick={() => setPage(1)} className="rounded bg-primary px-3 py-1.5 text-sm text-white">查询</button>
      </div>

      {loading ? (
        <p className="mt-6 text-slate-500">加载中…</p>
      ) : list.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">暂无资料</div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((doc) => (
            <Link
              key={doc.id}
              href={`/materials/${doc.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-primary"
            >
              <h2 className="font-medium text-slate-900 truncate">{doc.title}</h2>
              {doc.industry && <p className="mt-1 text-xs text-slate-500">{doc.industry}</p>}
              {doc.companyTags && <p className="mt-1 text-xs text-slate-400">{doc.companyTags}</p>}
              <p className="mt-2 text-primary font-medium">¥{doc.price}</p>
              <p className="text-xs text-slate-400">已售 {doc.saleCount} · 预览前{doc.previewPages}页</p>
            </Link>
          ))}
        </div>
      )}

      {total > pageSize && (
        <div className="mt-6 flex justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-1 text-sm disabled:opacity-50">上一页</button>
          <button type="button" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1 text-sm disabled:opacity-50">下一页</button>
        </div>
      )}
    </main>
  );
}
