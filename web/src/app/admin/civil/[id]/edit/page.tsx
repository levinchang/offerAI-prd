"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type CivilPost = {
  id: number;
  sourceKey: string;
  title: string | null;
  province: string | null;
  region: string | null;
  postType: string | null;
  detail: string | null;
  applyStartDate: string | null;
  applyEndDate: string | null;
  recruitCount: number | null;
  positionCount: number | null;
  educationRequirement: string | null;
  ageRequirement: string | null;
  positionsText: string | null;
  originalUrl: string | null;
  publishStatus: string;
  lifecycle: string;
};

export default function AdminCivilEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<CivilPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/civil/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setPost(d.data);
      });
  }, [id]);

  const handleSave = () => {
    if (!post) return;
    setSaving(true);
    fetch(`/api/admin/civil/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: post.title,
        province: post.province,
        region: post.region,
        postType: post.postType,
        detail: post.detail,
        applyStartDate: post.applyStartDate || null,
        applyEndDate: post.applyEndDate || null,
        recruitCount: post.recruitCount,
        positionCount: post.positionCount,
        educationRequirement: post.educationRequirement,
        ageRequirement: post.ageRequirement,
        positionsText: post.positionsText,
        originalUrl: post.originalUrl,
        publishStatus: post.publishStatus,
        lifecycle: post.lifecycle,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) alert("保存成功");
      })
      .finally(() => setSaving(false));
  };

  if (!post) return <div className="p-6">加载中…</div>;

  return (
    <div>
      <Link href="/admin/civil" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">编辑事业编 #{post.id}</h1>
      <div className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">标题</label>
          <input
            type="text"
            value={post.title ?? ""}
            onChange={(e) => setPost((p) => (p ? { ...p, title: e.target.value } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">省份</label>
            <input
              type="text"
              value={post.province ?? ""}
              onChange={(e) => setPost((p) => (p ? { ...p, province: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">地区</label>
            <input
              type="text"
              value={post.region ?? ""}
              onChange={(e) => setPost((p) => (p ? { ...p, region: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">类型</label>
          <input
            type="text"
            value={post.postType ?? ""}
            onChange={(e) => setPost((p) => (p ? { ...p, postType: e.target.value } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">报名开始</label>
            <input
              type="date"
              value={post.applyStartDate ?? ""}
              onChange={(e) => setPost((p) => (p ? { ...p, applyStartDate: e.target.value || null } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">报名截止</label>
            <input
              type="date"
              value={post.applyEndDate ?? ""}
              onChange={(e) => setPost((p) => (p ? { ...p, applyEndDate: e.target.value || null } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">原文链接</label>
          <input
            type="url"
            value={post.originalUrl ?? ""}
            onChange={(e) => setPost((p) => (p ? { ...p, originalUrl: e.target.value || null } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">详情</label>
          <textarea
            value={post.detail ?? ""}
            onChange={(e) => setPost((p) => (p ? { ...p, detail: e.target.value || null } : p))}
            rows={6}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">发布状态</label>
            <select
              value={post.publishStatus}
              onChange={(e) => setPost((p) => (p ? { ...p, publishStatus: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">生命周期</label>
            <select
              value={post.lifecycle}
              onChange={(e) => setPost((p) => (p ? { ...p, lifecycle: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="inactive">未上架</option>
              <option value="active">上架</option>
            </select>
          </div>
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
          <Link
            href="/admin/civil"
            className="rounded border border-slate-300 px-4 py-2 text-sm"
          >
            取消
          </Link>
        </div>
      </div>
    </div>
  );
}
