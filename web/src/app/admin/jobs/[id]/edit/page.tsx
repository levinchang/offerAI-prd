"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type CampusJob = {
  id: number;
  sourceKey: string;
  sourceLabel: string | null;
  companyName: string | null;
  companyType: string | null;
  recruitType: string | null;
  city: string | null;
  jobTitle: string | null;
  industry: string | null;
  sourceName: string | null;
  applyStartDate: string | null;
  applyEndDate: string | null;
  graduateRequirement: string | null;
  applyUrl: string | null;
  originalUrl: string | null;
  publishStatus: string;
  lifecycle: string;
  manualLock: boolean | null;
};

export default function AdminJobsEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const [job, setJob] = useState<CampusJob | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setJob(d.data);
      });
  }, [id]);

  const handleSave = () => {
    if (!job) return;
    setSaving(true);
    fetch(`/api/admin/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLabel: job.sourceLabel,
        companyName: job.companyName,
        companyType: job.companyType,
        recruitType: job.recruitType,
        city: job.city,
        jobTitle: job.jobTitle,
        industry: job.industry,
        sourceName: job.sourceName,
        applyStartDate: job.applyStartDate || null,
        applyEndDate: job.applyEndDate || null,
        graduateRequirement: job.graduateRequirement,
        applyUrl: job.applyUrl,
        originalUrl: job.originalUrl,
        publishStatus: job.publishStatus,
        lifecycle: job.lifecycle,
        manualLock: job.manualLock,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) alert("保存成功");
      })
      .finally(() => setSaving(false));
  };

  if (!job) return <div className="p-6">加载中…</div>;

  return (
    <div>
      <Link href="/admin/jobs" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">编辑校招岗位 #{job.id}</h1>
      <div className="mt-6 max-w-2xl space-y-4">
        <div className="text-sm text-slate-500">来源键: {job.sourceKey}</div>
        <div>
          <label className="block text-sm font-medium text-slate-700">公司名称</label>
          <input
            type="text"
            value={job.companyName ?? ""}
            onChange={(e) => setJob((p) => (p ? { ...p, companyName: e.target.value } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">岗位名称</label>
          <input
            type="text"
            value={job.jobTitle ?? ""}
            onChange={(e) => setJob((p) => (p ? { ...p, jobTitle: e.target.value } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">城市</label>
            <input
              type="text"
              value={job.city ?? ""}
              onChange={(e) => setJob((p) => (p ? { ...p, city: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">行业</label>
            <input
              type="text"
              value={job.industry ?? ""}
              onChange={(e) => setJob((p) => (p ? { ...p, industry: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">来源名称</label>
          <input
            type="text"
            value={job.sourceName ?? ""}
            onChange={(e) => setJob((p) => (p ? { ...p, sourceName: e.target.value } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">报名开始</label>
            <input
              type="date"
              value={job.applyStartDate ?? ""}
              onChange={(e) => setJob((p) => (p ? { ...p, applyStartDate: e.target.value || null } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">报名截止</label>
            <input
              type="date"
              value={job.applyEndDate ?? ""}
              onChange={(e) => setJob((p) => (p ? { ...p, applyEndDate: e.target.value || null } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">申请链接</label>
          <input
            type="url"
            value={job.applyUrl ?? ""}
            onChange={(e) => setJob((p) => (p ? { ...p, applyUrl: e.target.value || null } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">原文链接</label>
          <input
            type="url"
            value={job.originalUrl ?? ""}
            onChange={(e) => setJob((p) => (p ? { ...p, originalUrl: e.target.value || null } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">学历要求</label>
          <input
            type="text"
            value={job.graduateRequirement ?? ""}
            onChange={(e) => setJob((p) => (p ? { ...p, graduateRequirement: e.target.value || null } : p))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">发布状态</label>
            <select
              value={job.publishStatus}
              onChange={(e) => setJob((p) => (p ? { ...p, publishStatus: e.target.value } : p))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">生命周期</label>
            <select
              value={job.lifecycle}
              onChange={(e) => setJob((p) => (p ? { ...p, lifecycle: e.target.value } : p))}
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
          <Link href="/admin/jobs" className="rounded border border-slate-300 px-4 py-2 text-sm">取消</Link>
        </div>
      </div>
    </div>
  );
}
