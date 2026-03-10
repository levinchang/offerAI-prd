"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type MeData = {
  needLogin: boolean;
  user: { id: number; nickname: string; avatarUrl: string | null };
  campusExpireAt: string | null;
  civilExpireAt: string | null;
  orders: { id: number; orderNo: string; productType: string; orderStatus: string; payAmount: string; createdAt: string }[];
  purchasedDocs: { docId: number; title: string }[];
};

export default function MePage() {
  const [data, setData] = useState<MeData | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setData(d.data);
      });
  }, []);

  if (data === null) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <p className="text-slate-500">加载中…</p>
      </main>
    );
  }

  if (data.needLogin) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <p className="text-slate-600">请先登录</p>
        <button
          type="button"
          onClick={() => {
            fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: 1 }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.code === 0) window.location.reload();
              });
          }}
          className="mt-4 text-primary underline"
        >
          开发登录（userId=1）
        </button>
      </main>
    );
  }

  const { user, campusExpireAt, civilExpireAt, orders, purchasedDocs = [] } = data;

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800">个人中心</h1>

      {/* 头像与昵称 */}
      <section className="mt-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            {user.nickname.slice(0, 1)}
          </div>
        )}
        <div>
          <p className="font-medium text-slate-800">{user.nickname}</p>
          <p className="text-sm text-slate-500">ID: {user.id}</p>
        </div>
      </section>

      {/* 校招/事业编到期 */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700">会员权益</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-slate-600">校招会员</span>
            <span className={campusExpireAt ? "text-slate-800" : "text-slate-400"}>
              {campusExpireAt ? `至 ${campusExpireAt}` : "未开通"}
            </span>
          </li>
          <li className="flex justify-between">
            <span className="text-slate-600">事业编会员</span>
            <span className={civilExpireAt ? "text-slate-800" : "text-slate-400"}>
              {civilExpireAt ? `至 ${civilExpireAt}` : "未开通"}
            </span>
          </li>
        </ul>
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
        >
          立即开通
        </Link>
      </section>

      {/* 已购资料（来自 user_doc_access / purchasedDocs） */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700">已购资料</h2>
        {purchasedDocs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">暂无已购资料</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {purchasedDocs.map((d) => (
              <li key={d.docId}>
                <Link href={`/materials/${d.docId}`} className="text-slate-700 hover:text-primary">
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/materials" className="mt-3 inline-block text-sm text-primary underline">
          去面试资料
        </Link>
      </section>

      {/* 订单列表入口 */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <Link
          href="/me/orders"
          className="flex items-center justify-between text-slate-700 hover:text-primary"
        >
          <span className="font-medium">订单列表</span>
          <span className="text-sm text-slate-500">共 {orders.length} 笔</span>
        </Link>
      </section>
    </main>
  );
}
