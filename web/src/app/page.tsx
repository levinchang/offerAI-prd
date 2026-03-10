"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type JobsStats = {
  total: number;
  new24h: number;
  updated7d: number;
  updateDate: string;
};
type CivilStats = { total: number };

export default function HomePage() {
  const [jobsStats, setJobsStats] = useState<JobsStats | null>(null);
  const [civilStats, setCivilStats] = useState<CivilStats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/jobs/stats").then((r) => r.json()),
      fetch("/api/civil/stats").then((r) => r.json()),
    ]).then(([jobsRes, civilRes]) => {
      if (jobsRes?.code === 0 && jobsRes?.data)
        setJobsStats(jobsRes.data as JobsStats);
      if (civilRes?.code === 0 && civilRes?.data)
        setCivilStats(civilRes.data as CivilStats);
    });
  }, []);

  return (
    <main className="min-h-screen">
      {/* F2.1 Banner */}
      <section className="border-b border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            校招与事业编信息 · 面试资料 · 投递工作台
          </h1>
          <p className="mt-4 text-slate-600">
            一站式求职信息与进度管理，助你高效拿 Offer
          </p>
        </div>
      </section>

      {/* 三大功能入口 */}
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="text-xl font-semibold text-slate-800">核心功能</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <Link
            href="/jobs"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary hover:shadow"
          >
            <h3 className="font-medium text-slate-900">校招信息表</h3>
            <p className="mt-2 text-sm text-slate-500">
              筛选、收藏、投递进度，岗位原文与投递链接
            </p>
          </Link>
          <Link
            href="/civil"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary hover:shadow"
          >
            <h3 className="font-medium text-slate-900">事业编国企表</h3>
            <p className="mt-2 text-sm text-slate-500">
              省市区、类型、学历筛选，公告与报名链接
            </p>
          </Link>
          <Link
            href="/workspace"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary hover:shadow"
          >
            <h3 className="font-medium text-slate-900">投递工作台</h3>
            <p className="mt-2 text-sm text-slate-500">
              看板管理投递进度、分组与简历库
            </p>
          </Link>
        </div>
      </section>

      {/* 数据量概览 */}
      <section className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-xl font-semibold text-slate-800">数据概览</h2>
          <div className="mt-4 flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {jobsStats?.total ?? "—"}
              </p>
              <p className="text-sm text-slate-500">校招在招岗位</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {jobsStats?.new24h ?? "—"}
              </p>
              <p className="text-sm text-slate-500">24h 新增</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {civilStats?.total ?? "—"}
              </p>
              <p className="text-sm text-slate-500">事业编公告</p>
            </div>
            {jobsStats?.updateDate && (
              <p className="self-end text-xs text-slate-400">
                更新日期：{jobsStats.updateDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 权益对比 */}
      <section className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-xl font-semibold text-slate-800">会员权益</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-medium text-slate-700">权益</th>
                  <th className="px-4 py-3 font-medium text-slate-700">未开通</th>
                  <th className="px-4 py-3 font-medium text-primary">会员</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-700">校招岗位原文/投递链接</td>
                  <td className="px-4 py-3 text-slate-500">—</td>
                  <td className="px-4 py-3 text-slate-800">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-700">收藏与投递进度管理</td>
                  <td className="px-4 py-3 text-slate-500">—</td>
                  <td className="px-4 py-3 text-slate-800">✓</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-700">事业编公告/报名链接</td>
                  <td className="px-4 py-3 text-slate-500">—</td>
                  <td className="px-4 py-3 text-slate-800">✓</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-700">面试资料与已购资料</td>
                  <td className="px-4 py-3 text-slate-500">—</td>
                  <td className="px-4 py-3 text-slate-800">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 立即开通 CTA */}
      <section className="border-t border-slate-200 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-white hover:opacity-90"
          >
            立即开通
          </Link>
        </div>
      </section>
    </main>
  );
}
