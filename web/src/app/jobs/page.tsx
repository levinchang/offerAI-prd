"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

const STAGES = [
  "全部",
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

type Job = {
  id: number;
  companyName: string | null;
  jobTitle: string | null;
  city: string | null;
  industry: string | null;
  companyType: string | null;
  sourceName: string | null;
  applyUrl: string | null;
  originalUrl: string | null;
  applyStartDate: string | null;
  applyEndDate: string | null;
  updatedAt: string | null;
};

type Stats = {
  new24h: number;
  dueToday: number;
  updated7d: number;
  updated30d: number;
  total: number;
  intern: number;
  updateDate: string;
};

function formatUpdateDate(s: string) {
  const [y, m, d] = s.split("-");
  return `${y}年${m}月${d}日`;
}

export default function JobsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [list, setList] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [recruitType, setRecruitType] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [dictOptions, setDictOptions] = useState<{
    recruit_type: { code: string | null; label: string }[];
    industry: { code: string | null; label: string }[];
  }>({ recruit_type: [], industry: [] });
  const [session, setSession] = useState<{ userId: number | null; isCampusMember: boolean }>({
    userId: null,
    isCampusMember: false,
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [stageFilter, setStageFilter] = useState("全部");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [applyRecordMap, setApplyRecordMap] = useState<
    Record<number, { id: number; stage: string; remark: string | null }>
  >({});
  const [stageModal, setStageModal] = useState<{ jobId: number; jobTitle: string } | null>(null);
  const [stageJobTitleInput, setStageJobTitleInput] = useState("");
  const [remarkModal, setRemarkModal] = useState<{
    recordId: number;
    jobId: number;
    remark: string;
  } | null>(null);
  const [filterGroups, setFilterGroups] = useState<{ id: number; name: string }[]>([]);
  const [activeFilterGroupId, setActiveFilterGroupId] = useState<number | null>(null);
  const [saveFilterModal, setSaveFilterModal] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [manageGroupsModal, setManageGroupsModal] = useState(false);

  useEffect(() => {
    fetch("/api/dicts?field_key=recruit_type&field_key=industry")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          const data = d.data as Record<string, { code: string | null; label: string }[]>;
          setDictOptions({
            recruit_type: data.recruit_type ?? [],
            industry: data.industry ?? [],
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data)
          setSession({
            userId: d.data.userId ?? null,
            isCampusMember: !!d.data.isCampusMember,
          });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session.userId) {
      fetch("/api/jobs/filter-groups")
        .then((r) => r.json())
        .then((d) => {
          if (d.code === 0 && d.data?.list)
            setFilterGroups(d.data.list.map((g: { id: number; name: string }) => ({ id: g.id, name: g.name })));
        })
        .catch(() => {});
    } else setFilterGroups([]);
  }, [session.userId]);

  useEffect(() => {
    fetch("/api/jobs/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) setStats(d.data);
      })
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (keyword) params.set("keyword", keyword);
    if (recruitType.length) params.set("recruitType", recruitType.join(","));
    if (industry.length) params.set("industry", industry.join(","));
    if (onlyFavorites) params.set("only_favorites", "1");
    if (stageFilter && stageFilter !== "全部") params.set("stage", stageFilter);
    fetch(`/api/jobs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          setList(d.data.list ?? []);
          setTotal(d.data.total ?? 0);
          setFavoriteIds(d.data.favoriteIds ?? []);
          setApplyRecordMap(d.data.applyRecordMap ?? {});
        }
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, keyword, recruitType, industry, onlyFavorites, stageFilter]);

  const today = new Date().toISOString().slice(0, 10);
  const isDueSoon = (end: string | null) => {
    if (!end) return false;
    const endTime = new Date(end).getTime();
    const now = new Date();
    const in3 = now.getTime() + 3 * 24 * 60 * 60 * 1000;
    return endTime <= in3 && endTime >= now.getTime();
  };
  const isExpired = (end: string | null) =>
    end ? new Date(end).toISOString().slice(0, 10) < today : false;

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">校招信息表</h1>
        {!session.userId ? (
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
                  if (d.code === 0) {
                    setSession((s) => ({ ...s, userId: 1 }));
                    window.location.reload();
                  }
                });
            }}
            className="text-sm text-primary underline"
          >
            开发登录（userId=1）
          </button>
        ) : (
          <span className="text-sm text-slate-500">
            已登录 · {session.isCampusMember ? "校招会员" : "未开通会员"}
          </span>
        )}
      </div>

      {/* F3.1 24h 统计卡片 */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">
          更新日期：{stats ? formatUpdateDate(stats.updateDate) : "—"}
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { value: stats?.new24h ?? "—", label: "24h 内新增" },
            { value: stats?.dueToday ?? "—", label: "今日截止" },
            { value: stats?.updated7d ?? "—", label: "7 日内更新" },
            { value: stats?.updated30d ?? "—", label: "30 日内更新" },
            { value: stats?.total ?? "—", label: "累计职位数" },
            { value: stats?.intern ?? "—", label: "日常实习在招" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-lg font-semibold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* F3.2 校招会员引导：未开通显眼 CTA，已开通弱化 */}
      {!session.isCampusMember && (
        <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-800">
              开通校招会员，解锁岗位原文链接、投递链接，使用收藏与投递进度管理，提升求职效率。
            </p>
            <a
              href="/pricing"
              className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              立即开通
            </a>
          </div>
        </section>
      )}
      {session.isCampusMember && (
        <p className="mt-4 text-center text-xs text-slate-400">您已是校招会员，享受完整权益</p>
      )}

      {/* F3.3 筛选区 */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* F3.4 我的筛选分组、保存当前筛选、管理 */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">我的筛选分组：</span>
            <select
              value={activeFilterGroupId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setActiveFilterGroupId(null);
                  return;
                }
                if (!session.userId) {
                  alert("请先登录");
                  return;
                }
                const id = Number(v);
                fetch(`/api/jobs/filter-groups/${id}`)
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.code === 0 && d.data?.filters) {
                      const f = d.data.filters as { keyword?: string; recruitType?: string[]; industry?: string[] };
                      setKeyword(f.keyword ?? "");
                      setKeywordInput(f.keyword ?? "");
                      setRecruitType(f.recruitType ?? []);
                      setIndustry(f.industry ?? []);
                      setActiveFilterGroupId(id);
                      setPage(1);
                    }
                  });
              }}
              className="rounded border border-slate-300 px-2 py-1 text-sm min-w-[120px]"
            >
              <option value="">默认</option>
              {filterGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!session.userId) {
                alert("请先登录");
                return;
              }
              setSaveFilterName("");
              setSaveFilterModal(true);
            }}
            className="text-sm text-primary underline"
          >
            保存当前筛选
          </button>
          <button
            type="button"
            onClick={() => {
              if (!session.userId) {
                alert("请先登录");
                return;
              }
              setManageGroupsModal(true);
            }}
            className="text-sm text-slate-600 underline"
          >
            管理
          </button>
          <input
            type="text"
            placeholder="搜索职位、公司"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setKeyword(keywordInput.trim())}
            className="rounded border border-slate-300 px-3 py-2 text-sm w-48"
          />
          <button
            type="button"
            onClick={() => setKeyword(keywordInput.trim())}
            className="rounded bg-primary px-3 py-2 text-sm text-white hover:opacity-90"
          >
            搜索
          </button>
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-500 text-sm">招聘类型：</span>
            {dictOptions.recruit_type.map((opt) => {
              const v = opt.code ?? opt.label;
              const on = recruitType.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setRecruitType((prev) =>
                      on ? prev.filter((x) => x !== v) : [...prev, v]
                    )
                  }
                  className={`rounded px-2 py-1 text-sm border ${
                    on ? "border-primary bg-primary/10 text-primary" : "border-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-500 text-sm">行业：</span>
            {dictOptions.industry.map((opt) => {
              const v = opt.code ?? opt.label;
              const on = industry.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setIndustry((prev) =>
                      on ? prev.filter((x) => x !== v) : [...prev, v]
                    )
                  }
                  className={`rounded px-2 py-1 text-sm border ${
                    on ? "border-primary bg-primary/10 text-primary" : "border-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {/* F3.7 仅看收藏、求职进度 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => {
                if (!session.userId) {
                  alert("请先登录");
                  return;
                }
                setOnlyFavorites(e.target.checked);
                setPage(1);
              }}
              className="rounded"
            />
            <span className="text-sm">仅看收藏</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">求职进度：</span>
            <select
              value={stageFilter}
              onChange={(e) => {
                const v = e.target.value;
                if (v !== "全部" && !session.userId) {
                  alert("请先登录");
                  return;
                }
                setStageFilter(v);
                setPage(1);
              }}
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setKeywordInput("");
              setRecruitType([]);
              setIndustry([]);
              setOnlyFavorites(false);
              setStageFilter("全部");
              setActiveFilterGroupId(null);
              setPage(1);
            }}
            className="text-sm text-slate-600 underline"
          >
            重置
          </button>
        </div>
      </section>

      {loading ? (
        <p className="mt-4 text-slate-500">加载中…</p>
      ) : (
        <>
          <div className="mt-6 rounded-lg border border-slate-200 overflow-hidden bg-white">
            <Table>
              <TableHead>
                <Th>更新时间</Th>
                <Th>公司名称</Th>
                <Th>岗位</Th>
                <Th>工作城市</Th>
                <Th>行业</Th>
                <Th>信息来源</Th>
                <Th>网申时间</Th>
                <Th>投递链接</Th>
                <Th>操作专区</Th>
                <Th>收藏</Th>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <tr>
                    <Td colSpan={10} className="text-center text-slate-500 py-8">
                      {onlyFavorites
                        ? "暂无收藏"
                        : stageFilter && stageFilter !== "全部"
                          ? "该进度下暂无岗位"
                          : keyword || recruitType.length > 0 || industry.length > 0
                            ? "未找到相关岗位，请调整筛选条件"
                            : "暂无岗位信息"}
                    </Td>
                  </tr>
                ) : (
                  list.map((row) => {
                    const end = row.applyEndDate;
                    const soon = isDueSoon(end);
                    const expired = isExpired(end);
                    const rowClass = expired
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-100"
                      : soon
                        ? "bg-red-50 hover:bg-red-50"
                        : "hover:bg-slate-50";
                    const timeRange =
                      row.applyStartDate && end
                        ? `${row.applyStartDate}～${end}`
                        : end
                          ? `～${end}`
                          : "尽快投递";
                    const record = applyRecordMap[row.id];
                    const recordId = record?.id;
                    const isFav = favoriteIds.includes(row.id);
                    const sourceLink =
                      session.isCampusMember && row.originalUrl ? (
                        <a
                          href={row.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          公告原文
                        </a>
                      ) : (
                        <span className="text-slate-400">
                          {session.userId ? "开通会员解锁" : "登录后可查看"}
                        </span>
                      );
                    const applyLink =
                      session.isCampusMember && row.applyUrl ? (
                        <a
                          href={row.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          点击投递
                        </a>
                      ) : (
                        <span className="text-slate-400">
                          {session.userId ? "开通会员解锁" : "登录后可查看"}
                        </span>
                      );
                    return (
                      <tr key={row.id} className={rowClass}>
                        <Td className="text-slate-600">
                          {row.updatedAt
                            ? new Date(row.updatedAt).toLocaleDateString("zh-CN")
                            : "—"}
                        </Td>
                        <Td>
                          <span>{row.companyName ?? "—"}</span>
                          {row.companyType && (
                            <span className="ml-1 text-xs text-slate-500">
                              （{row.companyType}）
                            </span>
                          )}
                        </Td>
                        <Td>{row.jobTitle ?? "—"}</Td>
                        <Td>{row.city ?? "—"}</Td>
                        <Td>{row.industry ?? "—"}</Td>
                        <Td>
                          {row.sourceName ?? "—"}
                          {row.sourceName && (
                            <span className="ml-1">{sourceLink}</span>
                          )}
                        </Td>
                        <Td className={soon ? "text-red-600 font-medium" : expired ? "text-slate-400" : ""}>
                          {timeRange}
                        </Td>
                        <Td>{applyLink}</Td>
                        <Td>
                          <select
                            value={record?.stage ?? "暂无"}
                            onChange={(e) => {
                              if (!session.userId) {
                                alert("请先登录");
                                return;
                              }
                              if (!session.isCampusMember) {
                                alert("开通会员后可使用");
                                return;
                              }
                              const v = e.target.value;
                              if (v === "已投递") {
                                setStageModal({
                                  jobId: row.id,
                                  jobTitle: row.jobTitle ?? "",
                                });
                                return;
                              }
                              fetch("/api/apply-records", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  campus_job_id: row.id,
                                  stage: v,
                                }),
                              })
                                .then((r) => r.json())
                                .then((d) => {
                                  if (d.code === 0) {
                                    setApplyRecordMap((prev) => ({
                                      ...prev,
                                      [row.id]: {
                                        id: d.data?.id ?? prev[row.id]?.id ?? 0,
                                        stage: v,
                                        remark: prev[row.id]?.remark ?? null,
                                      },
                                    }));
                                  }
                                });
                            }}
                            className="text-sm border rounded px-1 py-0.5"
                          >
                            {STAGES.filter((s) => s !== "全部").map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (!session.userId) {
                                alert("请先登录");
                                return;
                              }
                              if (!session.isCampusMember) {
                                alert("开通会员后可使用");
                                return;
                              }
                              if (recordId == null) {
                                fetch(
                                  `/api/apply-records?campus_job_id=${row.id}`
                                )
                                  .then((r) => r.json())
                                  .then((d) => {
                                    const list = d.data?.list ?? [];
                                    const r0 = list[0];
                                    if (r0)
                                      setRemarkModal({
                                        recordId: r0.id,
                                        jobId: row.id,
                                        remark: r0.remark ?? "",
                                      });
                                    else {
                                      fetch("/api/apply-records", {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          campus_job_id: row.id,
                                          stage: "暂无",
                                        }),
                                      })
                                        .then((r2) => r2.json())
                                        .then((d2) => {
                                          if (d2.code === 0 && d2.data?.id)
                                            setRemarkModal({
                                              recordId: d2.data.id,
                                              jobId: row.id,
                                              remark: "",
                                            });
                                        });
                                    }
                                  });
                              } else
                                setRemarkModal({
                                  recordId,
                                  jobId: row.id,
                                  remark: record?.remark ?? "",
                                });
                            }}
                            className="ml-1 text-xs text-slate-600 underline"
                          >
                            备注
                          </button>
                        </Td>
                        <Td>
                          <button
                            type="button"
                            onClick={() => {
                              if (!session.userId) {
                                alert("请先登录");
                                return;
                              }
                              const method = isFav ? "DELETE" : "POST";
                              const url = isFav
                                ? `/api/favorites?target_type=campus&target_id=${row.id}`
                                : "/api/favorites";
                              fetch(url, {
                                method,
                                ...(method === "POST" && {
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    target_type: "campus",
                                    target_id: row.id,
                                  }),
                                }),
                              })
                                .then((r) => r.json())
                                .then((d) => {
                                  if (d.code === 0)
                                    setFavoriteIds((prev) =>
                                      isFav
                                        ? prev.filter((x) => x !== row.id)
                                        : [...prev, row.id]
                                    );
                                });
                            }}
                            className="text-lg leading-none"
                            aria-label={isFav ? "取消收藏" : "收藏"}
                          >
                            {isFav ? "★" : "☆"}
                          </button>
                        </Td>
                      </tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span>共 {total} 条</span>
            <div className="flex items-center gap-3">
              <span>每页</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>条</span>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 cursor-pointer"
              >
                上一页
              </button>
              <span>第 {page} 页</span>
              <button
                type="button"
                disabled={page * pageSize >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 cursor-pointer"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}

      {/* 标记进度：已投递 — 填写投递岗位 */}
      {stageModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow">
            <p className="font-medium text-slate-800">填写投递岗位</p>
            <p className="mt-1 text-sm text-slate-500">
              您在该企业实际投递的岗位名称（可与列表岗位不一致）
            </p>
            <input
              type="text"
              value={stageJobTitleInput}
              onChange={(e) => setStageJobTitleInput(e.target.value)}
              placeholder={stageModal.jobTitle || "如：产品经理"}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setStageModal(null);
                  setStageJobTitleInput("");
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
                      campus_job_id: stageModal.jobId,
                      stage: "已投递",
                      job_title: stageJobTitleInput.trim() || stageModal.jobTitle,
                    }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.code === 0) {
                        setApplyRecordMap((prev) => ({
                          ...prev,
                          [stageModal.jobId]: {
                            id: d.data?.id ?? 0,
                            stage: "已投递",
                            remark: null,
                          },
                        }));
                        setStageModal(null);
                        setStageJobTitleInput("");
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

      {/* 编辑备注 */}
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
              placeholder="对企业/岗位的备注信息"
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
                      id: remarkModal.recordId,
                      remark: remarkModal.remark,
                    }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.code === 0) {
                        setApplyRecordMap((prev) => {
                          const cur = prev[remarkModal.jobId];
                          return {
                            ...prev,
                            [remarkModal.jobId]: {
                              id: remarkModal.recordId,
                              stage: cur?.stage ?? "暂无",
                              remark: remarkModal.remark,
                            },
                          };
                        });
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

      {/* F3.4 保存当前筛选 */}
      {saveFilterModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow">
            <p className="font-medium text-slate-800">保存当前筛选</p>
            <p className="mt-2 text-sm text-slate-500">当前条件：{keyword ? `关键词「${keyword}」` : ""} {recruitType.length ? `招聘类型 ${recruitType.join("、")}` : ""} {industry.length ? `行业 ${industry.join("、")}` : ""} {!keyword && !recruitType.length && !industry.length ? "无" : ""}</p>
            <label className="mt-3 block text-sm font-medium text-slate-700">分组名称（必填）</label>
            <input
              type="text"
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              placeholder="如：广州产品岗"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSaveFilterModal(false)}
                className="rounded border border-slate-300 px-3 py-1 text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!saveFilterName.trim()) {
                    alert("请输入分组名称");
                    return;
                  }
                  fetch("/api/jobs/filter-groups", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: saveFilterName.trim(),
                      filters: {
                        keyword: keyword || undefined,
                        recruitType: recruitType.length ? recruitType : undefined,
                        industry: industry.length ? industry : undefined,
                      },
                    }),
                  })
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.code === 0 && d.data) {
                        setSaveFilterModal(false);
                        setSaveFilterName("");
                        return fetch("/api/jobs/filter-groups", { method: "GET" }).then((r) => r.json());
                      }
                    })
                    .then((d) => {
                      if (d?.code === 0 && Array.isArray(d.data)) setFilterGroups(d.data);
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

      {/* F3.4 管理分组 */}
      {manageGroupsModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow">
            <p className="font-medium text-slate-800">管理筛选分组</p>
            <ul className="mt-3 max-h-60 overflow-y-auto space-y-2">
              {filterGroups.length === 0 ? (
                <li className="text-sm text-slate-500">暂无分组</li>
              ) : (
                filterGroups.map((g) => (
                  <li key={g.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                    <span>{g.name}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`确定删除分组「${g.name}」？`)) return;
                          fetch(`/api/jobs/filter-groups/${g.id}`, { method: "DELETE" })
                            .then((r) => r.json())
                            .then((d) => {
                              if (d.code === 0) {
                                setFilterGroups((prev) => prev.filter((x) => x.id !== g.id));
                                if (activeFilterGroupId === g.id) {
                                  setActiveFilterGroupId(null);
                                  setKeyword("");
                                  setKeywordInput("");
                                  setRecruitType([]);
                                  setIndustry([]);
                                  setPage(1);
                                }
                              }
                            });
                        }}
                        className="text-red-600 underline"
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setManageGroupsModal(false)}
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
