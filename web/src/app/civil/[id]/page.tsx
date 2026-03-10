"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type CivilPost = {
  id: number;
  title: string | null;
  province: string | null;
  region: string | null;
  postType: string | null;
  educationRequirement: string | null;
  applyStartDate: string | null;
  applyEndDate: string | null;
  recruitCount: number | null;
  positionCount: number | null;
  positionsText: string | null;
  detail: string | null;
  originalUrl: string | null;
  updatedAt: string | null;
};

export default function CivilDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<CivilPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/civil/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setPost(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main className="min-h-screen p-6"><p className="text-slate-500">加载中…</p></main>;
  if (!post) return <main className="min-h-screen p-6"><p className="text-slate-500">公告不存在或已下架</p><Link href="/civil" className="text-primary underline">返回列表</Link></main>;

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <Link href="/civil" className="text-sm text-primary hover:underline">← 事业编列表</Link>
      <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">{post.title ?? "—"}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>省份：{post.province ?? "—"}</span>
          <span>地区：{post.region ?? "—"}</span>
          <span>类型：{post.postType ?? "—"}</span>
          <span>学历：{post.educationRequirement ?? "—"}</span>
          <span>报名时间：{post.applyStartDate ?? "—"} ~ {post.applyEndDate ?? "—"}</span>
          <span>招聘人数：{post.recruitCount ?? post.positionCount ?? "—"}</span>
          <span>更新时间：{post.updatedAt?.slice(0, 10) ?? "—"}</span>
        </div>
        {post.positionsText && (
          <p className="mt-4 text-sm text-slate-700">岗位：{post.positionsText}</p>
        )}
        {post.detail && (
          <div className="mt-4 prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
            {post.detail}
          </div>
        )}
        <div className="mt-6 flex gap-4">
          {post.originalUrl ? (
            <a
              href={post.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
            >
              查看原文/报名链接
            </a>
          ) : (
            <span className="rounded-lg bg-slate-200 px-4 py-2 text-sm text-slate-500">
              开通会员后可查看原文与报名链接
            </span>
          )}
        </div>
      </article>
    </main>
  );
}
