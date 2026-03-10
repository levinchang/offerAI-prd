"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STAGES = [
  "待投递",
  "已投递",
  "待笔试",
  "已笔试",
  "一面",
  "二面",
  "三面",
  "已offer",
  "未通过",
];

type ApplyRecord = {
  id: number;
  sourceType: string;
  companyName: string | null;
  jobTitle: string | null;
  stage: string;
  remark: string | null;
  appliedAt: string | null;
  updatedAt: string | null;
};

type Group = { id: number; name: string };
type Resume = { id: number; name: string; fileUrl: string | null };

export default function WorkspacePage() {
  const [records, setRecords] = useState<ApplyRecord[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [session, setSession] = useState<{ userId: number | null }>({ userId: null });
  const [addModal, setAddModal] = useState(false);
  const [addCompany, setAddCompany] = useState("");
  const [addJobTitle, setAddJobTitle] = useState("");
  const [remarkModal, setRemarkModal] = useState<{ id: number; remark: string } | null>(null);
  const [manageGroupModal, setManageGroupModal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setSession({ userId: d.data.userId ?? null });
      });
  }, []);

  const loadRecords = () => {
    if (!session.userId) return;
    const params = new URLSearchParams();
    if (groupId) params.set("group_id", groupId);
    fetch(`/api/apply-records?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.list) setRecords(d.data.list);
      });
  };

  const loadGroups = () => {
    if (!session.userId) return;
    fetch("/api/workspace/groups")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.list) setGroups(d.data.list);
      });
  };

  const loadResumes = () => {
    if (!session.userId) return;
    fetch("/api/workspace/resumes")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data?.list) setResumes(d.data.list);
      });
  };

  useEffect(() => {
    if (session.userId) {
      loadRecords();
      loadGroups();
      loadResumes();
    }
  }, [session.userId, groupId]);

  const byStage = STAGES.reduce(
    (acc, s) => {
      acc[s] = records.filter((r) => r.stage === s);
      return acc;
    },
    {} as Record<string, ApplyRecord[]>
  );

  if (!session.userId) {
    return (
      <main className="min-h-screen p-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-semibold text-slate-800">投递工作台</h1>
        <p className="mt-4 text-slate-600">请先登录后使用工作台。</p>
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
          开发登录
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto flex gap-6">
      {/* 左侧导航 */}
      <aside className="w-48 shrink-0 space-y-2">
        <h2 className="font-semibold text-slate-800">工作台</h2>
        <nav className="flex flex-col gap-1">
          <span className="text-sm font-medium text-primary">投递进度</span>
          <Link href="/jobs" className="text-sm text-slate-600 hover:text-slate-900">
            收藏职位（校招）
          </Link>
          <Link href="/civil" className="text-sm text-slate-600 hover:text-slate-900">
            收藏职位（事业编）
          </Link>
          <span className="text-sm text-slate-600">我的简历</span>
          <Link href="/me" className="text-sm text-slate-600 hover:text-slate-900">
            账号设置
          </Link>
        </nav>
        <div className="pt-2">
          <label className="block text-xs text-slate-500">按分组</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="">全部分组</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setManageGroupModal(true)}
            className="mt-2 text-xs text-primary underline"
          >
            管理分组
          </button>
        </div>
      </aside>

      {/* 主内容：看板 / 列表 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">投递进度</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView(view === "kanban" ? "list" : "kanban")}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              {view === "kanban" ? "列表" : "看板"}
            </button>
            <button
              type="button"
              onClick={() => setAddModal(true)}
              className="rounded bg-primary px-3 py-1 text-sm text-white"
            >
              手动新增
            </button>
          </div>
        </div>

        {view === "kanban" ? (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <div
                key={stage}
                className="w-56 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-medium text-slate-700">{stage}</p>
                <p className="text-xs text-slate-500">
                  {byStage[stage]?.length ?? 0} 条
                </p>
                <ul className="mt-2 space-y-2">
                  {(byStage[stage] ?? []).map((r) => (
                    <li
                      key={r.id}
                      className="rounded border border-slate-200 bg-white p-2 text-sm"
                    >
                      <p className="font-medium text-slate-800 truncate">
                        {r.companyName ?? "—"}
                      </p>
                      <p className="text-slate-600 truncate">{r.jobTitle ?? "—"}</p>
                      <p className="text-xs text-slate-400">
                        {r.sourceType} · {r.updatedAt?.slice(0, 10)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <select
                          value={r.stage}
                          onChange={(e) => {
                            const v = e.target.value;
                            fetch("/api/apply-records", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: r.id, stage: v }),
                            }).then((res) => res.json()).then((d) => {
                              if (d.code === 0) loadRecords();
                            });
                          }}
                          className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            setRemarkModal({ id: r.id, remark: r.remark ?? "" })
                          }
                          className="text-xs text-primary underline"
                        >
                          备注
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm("确定删除该条记录？")) return;
                            fetch(`/api/apply-records?id=${r.id}`, {
                              method: "DELETE",
                            }).then((res) => res.json()).then((d) => {
                              if (d.code === 0) loadRecords();
                            });
                          }}
                          className="text-xs text-red-600 underline"
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 font-medium">公司/岗位</th>
                  <th className="px-4 py-2 font-medium">来源</th>
                  <th className="px-4 py-2 font-medium">阶段</th>
                  <th className="px-4 py-2 font-medium">更新</th>
                  <th className="px-4 py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-4 py-2">
                      {r.companyName ?? "—"} / {r.jobTitle ?? "—"}
                    </td>
                    <td className="px-4 py-2">{r.sourceType}</td>
                    <td className="px-4 py-2">{r.stage}</td>
                    <td className="px-4 py-2">{r.updatedAt?.slice(0, 10)}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRemarkModal({ id: r.id, remark: r.remark ?? "" })
                        }
                        className="text-primary underline mr-2"
                      >
                        备注
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm("确定删除？")) return;
                          fetch(`/api/apply-records?id=${r.id}`, {
                            method: "DELETE",
                          }).then((res) => res.json()).then((d) => {
                            if (d.code === 0) loadRecords();
                          });
                        }}
                        className="text-red-600 underline"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && (
              <p className="p-8 text-center text-slate-500">暂无投递记录</p>
            )}
          </div>
        )}

        {/* 我的简历 */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800">我的简历</h2>
          {resumes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">暂无简历，可手动添加名称（文件上传预留）。</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {resumes.map((res) => (
                <li
                  key={res.id}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <span>{res.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm("确定删除？")) return;
                      fetch(`/api/workspace/resumes/${res.id}`, {
                        method: "DELETE",
                      }).then((r) => r.json()).then((d) => {
                        if (d.code === 0) loadResumes();
                      });
                    }}
                    className="text-red-600 underline"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => {
              const name = prompt("简历名称");
              if (!name?.trim()) return;
              fetch("/api/workspace/resumes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
              }).then((r) => r.json()).then((d) => {
                if (d.code === 0) loadResumes();
              });
            }}
            className="mt-2 rounded border border-slate-300 px-3 py-1 text-sm"
          >
            添加简历
          </button>
        </section>
      </div>

      {/* 手动新增弹窗 */}
      {addModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow">
            <p className="font-medium text-slate-800">手动新增投递记录</p>
            <input
              type="text"
              value={addCompany}
              onChange={(e) => setAddCompany(e.target.value)}
              placeholder="公司名称"
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={addJobTitle}
              onChange={(e) => setAddJobTitle(e.target.value)}
              placeholder="岗位名称"
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddModal(false);
                  setAddCompany("");
                  setAddJobTitle("");
                }}
                className="rounded border border-slate-300 px-3 py-1 text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  fetch("/api/apply-records", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      source_type: "manual",
                      company_name: addCompany.trim(),
                      job_title: addJobTitle.trim(),
                      stage: "待投递",
                    }),
                  }).then((r) => r.json()).then((d) => {
                    if (d.code === 0) {
                      loadRecords();
                      setAddModal(false);
                      setAddCompany("");
                      setAddJobTitle("");
                    }
                  });
                }}
                className="rounded bg-primary px-3 py-1 text-sm text-white"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 备注弹窗 */}
      {remarkModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow">
            <p className="font-medium text-slate-800">编辑备注</p>
            <textarea
              value={remarkModal.remark}
              onChange={(e) =>
                setRemarkModal((prev) =>
                  prev ? { ...prev, remark: e.target.value } : null
                )
              }
              rows={3}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemarkModal(null)}
                className="rounded border border-slate-300 px-3 py-1 text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  fetch("/api/apply-records", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: remarkModal.id,
                      remark: remarkModal.remark,
                    }),
                  }).then((r) => r.json()).then((d) => {
                    if (d.code === 0) {
                      loadRecords();
                      setRemarkModal(null);
                    }
                  });
                }}
                className="rounded bg-primary px-3 py-1 text-sm text-white"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 管理分组弹窗 */}
      {manageGroupModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow">
            <p className="font-medium text-slate-800">管理分组</p>
            <ul className="mt-3 space-y-2">
              {groups.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm"
                >
                  <span>{g.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`确定删除分组「${g.name}」？`)) return;
                      fetch(`/api/workspace/groups/${g.id}`, {
                        method: "DELETE",
                      }).then((r) => r.json()).then((d) => {
                        if (d.code === 0) {
                          loadGroups();
                          if (String(g.id) === groupId) setGroupId("");
                        }
                      });
                    }}
                    className="text-red-600 underline"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                const name = prompt("新分组名称");
                if (!name?.trim()) return;
                fetch("/api/workspace/groups", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: name.trim() }),
                }).then((r) => r.json()).then((d) => {
                  if (d.code === 0) loadGroups();
                });
              }}
              className="mt-3 rounded border border-slate-300 px-3 py-1 text-sm"
            >
              新建分组
            </button>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setManageGroupModal(false)}
                className="rounded border border-slate-300 px-3 py-1 text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
