"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminJobsNewPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    city: "",
    industry: "",
    sourceName: "",
    applyStartDate: "",
    applyEndDate: "",
    applyUrl: "",
    originalUrl: "",
    graduateRequirement: "",
    publishStatus: "draft",
    lifecycle: "active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      company_name: form.companyName || null,
      job_title: form.jobTitle || null,
      city: form.city || null,
      industry: form.industry || null,
      source_name: form.sourceName || null,
      apply_start_date: form.applyStartDate || null,
      apply_end_date: form.applyEndDate || null,
      apply_url: form.applyUrl || null,
      original_url: form.originalUrl || null,
      graduate_requirement: form.graduateRequirement || null,
      publish_status: form.publishStatus,
      lifecycle: form.lifecycle,
    };
    fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.id) {
          window.location.href = `/admin/jobs/${d.data.id}/edit`;
        } else {
          alert(d.message || "创建失败");
        }
      })
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <Link href="/admin/jobs" className="text-primary underline">← 列表</Link>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">新增校招岗位</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">公司名称</label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">岗位名称</label>
          <input
            type="text"
            value={form.jobTitle}
            onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">城市</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">行业</label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">来源名称</label>
          <input
            type="text"
            value={form.sourceName}
            onChange={(e) => setForm((f) => ({ ...f, sourceName: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">报名开始</label>
            <input
              type="date"
              value={form.applyStartDate}
              onChange={(e) => setForm((f) => ({ ...f, applyStartDate: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">报名截止</label>
            <input
              type="date"
              value={form.applyEndDate}
              onChange={(e) => setForm((f) => ({ ...f, applyEndDate: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">申请链接</label>
          <input
            type="url"
            value={form.applyUrl}
            onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">原文链接</label>
          <input
            type="url"
            value={form.originalUrl}
            onChange={(e) => setForm((f) => ({ ...f, originalUrl: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">学历要求</label>
          <input
            type="text"
            value={form.graduateRequirement}
            onChange={(e) => setForm((f) => ({ ...f, graduateRequirement: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">发布状态</label>
            <select
              value={form.publishStatus}
              onChange={(e) => setForm((f) => ({ ...f, publishStatus: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">生命周期</label>
            <select
              value={form.lifecycle}
              onChange={(e) => setForm((f) => ({ ...f, lifecycle: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="inactive">未上架</option>
              <option value="active">上架</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "提交中…" : "创建"}
          </button>
          <Link href="/admin/jobs" className="rounded border border-slate-300 px-4 py-2 text-sm">取消</Link>
        </div>
      </form>
    </div>
  );
}
