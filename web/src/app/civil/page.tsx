"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";
import Link from "next/link";

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
  originalUrl: string | null;
  updatedAt: string | null;
};

type CivilStats = { total: number };

export default function CivilPage() {
  const [stats, setStats] = useState<CivilStats | null>(null);
  const [list, setList] = useState<CivilPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [province, setProvince] = useState<string[]>([]);
  const [postType, setPostType] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [endBefore, setEndBefore] = useState("");
  const [dictCivilType, setDictCivilType] = useState<{ code: string | null; label: string }[]>([]);
  const [session, setSession] = useState<{ userId: number | null; isCivilMember: boolean }>({
    userId: null,
    isCivilMember: false,
  });
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [stageFilter, setStageFilter] = useState("全部");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [applyRecordMap, setApplyRecordMap] = useState<
    Record<number, { id: number; stage: string; remark: string | null }>
  >({});

  useEffect(() => {
    fetch("/api/dicts?field_key=civil_type")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && d.data) {
          const raw = d.data as { civil_type?: { code: string | null; label: string }[]; items?: { code: string | null; label: string }[] };
          const items = raw.civil_type ?? raw.items ?? [];
          setDictCivilType(Array.isArray(items) ? items : []);
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
            isCivilMember: !!d.data.isCivilMember,
          });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/civil/stats")
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
    if (province.length) params.set("province", province.join(","));
    if (postType.length) params.set("postType", postType.join(","));
    if (education) params.set("education", education);
    if (endBefore) params.set("endBefore", endBefore);
    if (onlyFavorites) params.set("only_favorites", "1");
    if (stageFilter && stageFilter !== "全部") params.set("stage", stageFilter);
    fetch(`/api/civil?${params}`)
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
  }, [page, pageSize, keyword, province, postType, education, endBefore, onlyFavorites, stageFilter]);

  const today = new Date().toISOString().slice(0, 10);
  const isExpired = (end: string | null) =>
    end ? new Date(end).toISOString().slice(0, 10) < today : false;

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">事业编国企表</h1>
        {!session.userId ? (
          <span className="text-sm text-slate-500">登录后可收藏、管理投递进度</span>
        ) : (
          <span className="text-sm text-slate-500">
            已登录 · {session.isCivilMember ? "事业编会员" : "未开通会员"}
          </span>
        )}
      </div>

      {/* 统计区 */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-lg font-semibold text-slate-900">{stats?.total ?? "—"}</p>
            <p className="text-xs text-slate-500">在招公告数</p>
          </div>
        </div>
      </section>

      {/* 筛选区 */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="关键词"
            className="rounded border border-slate-300 px-2 py-1 text-sm w-32"
          />
          <span className="text-slate-500 text-sm">省份：</span>
          <select
            multiple
            value={province}
            onChange={(e) =>
              setProvince(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="rounded border border-slate-300 px-2 py-1 text-sm min-w-[100px]"
          >
            <option value="北京">北京</option>
            <option value="上海">上海</option>
            <option value="广东">广东</option>
            <option value="浙江">浙江</option>
            <option value="江苏">江苏</option>
            <option value="四川">四川</option>
            <option value="湖北">湖北</option>
            <option value="山东">山东</option>
            <option value="福建">福建</option>
            <option value="河南">河南</option>
          </select>
          <span className="text-slate-500 text-sm">类型：</span>
          <select
            multiple
            value={postType}
            onChange={(e) =>
              setPostType(Array.from(e.target.selectedOptions, (o) => o.value))
            }
            className="rounded border border-slate-300 px-2 py-1 text-sm min-w-[100px]"
          >
            {dictCivilType.map((o) => (
              <option key={o.code ?? o.label} value={o.code ?? o.label}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="学历"
            className="rounded border border-slate-300 px-2 py-1 text-sm w-24"
          />
          <span className="text-slate-500 text-sm">截止 before：</span>
          <input
            type="date"
            value={endBefore}
            onChange={(e) => setEndBefore(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          />
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(e) => {
                setOnlyFavorites(e.target.checked);
                setPage(1);
              }}
            />
            仅看收藏
          </label>
          <select
            value={stageFilter}
            onChange={(e) => {
              setStageFilter(e.target.value);
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
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setProvince([]);
              setPostType([]);
              setEducation("");
              setEndBefore("");
              setOnlyFavorites(false);
              setStageFilter("全部");
              setPage(1);
            }}
            className="text-sm text-primary underline"
          >
            重置
          </button>
        </div>
      </section>

      {/* 表格 */}
      <section className="mt-6 rounded-lg border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-500">加载中…</p>
        ) : list.length === 0 ? (
          <p className="p-8 text-center text-slate-500">暂无数据</p>
        ) : (
          <Table>
            <TableHead>
              <Th>更新时间</Th>
              <Th>标题</Th>
              <Th>省/市</Th>
              <Th>类型</Th>
              <Th>报名时间</Th>
              <Th>人数</Th>
              <Th>学历</Th>
              <Th>原文链接</Th>
              <Th>操作</Th>
            </TableHead>
            <TableBody>
              {list.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <Td className="text-slate-600 text-sm">
                    {row.updatedAt?.slice(0, 10) ?? "—"}
                  </Td>
                  <Td>
                    <Link
                      href={`/civil/${row.id}`}
                      className="text-primary hover:underline"
                    >
                      {row.title ?? "—"}
                    </Link>
                    {isExpired(row.applyEndDate) && (
                      <span className="ml-2 text-xs text-red-600">已截止</span>
                    )}
                  </Td>
                  <Td>{row.province ?? "—"} / {row.region ?? "—"}</Td>
                  <Td>{row.postType ?? "—"}</Td>
                  <Td className="text-sm">
                    {row.applyStartDate ?? "—"} ~ {row.applyEndDate ?? "—"}
                  </Td>
                  <Td>{row.recruitCount ?? row.positionCount ?? "—"}</Td>
                  <Td>{row.educationRequirement ?? "—"}</Td>
                  <Td>
                    {session.isCivilMember && row.originalUrl ? (
                      <a
                        href={row.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        原文
                      </a>
                    ) : (
                      <span className="text-slate-400">
                        {session.userId ? "开通会员解锁" : "登录后可查看"}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {session.userId ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const isFav = favoriteIds.includes(row.id);
                            isFav
                              ? fetch(
                                  `/api/favorites?target_type=civil&target_id=${row.id}`,
                                  { method: "DELETE" }
                                )
                              : fetch("/api/favorites", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    target_type: "civil",
                                    target_id: row.id,
                                  }),
                                })
                              .then((r) => r.json())
                              .then((d) => {
                                if (d.code === 0) {
                                  setFavoriteIds((prev) =>
                                    isFav
                                      ? prev.filter((id) => id !== row.id)
                                      : [...prev, row.id]
                                  );
                                }
                              });
                          }}
                          className="text-primary underline mr-2"
                        >
                          {favoriteIds.includes(row.id) ? "取消收藏" : "收藏"}
                        </button>
                        <select
                          value={applyRecordMap[row.id]?.stage ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!v) return;
                            if (!session.userId) return;
                            const rec = applyRecordMap[row.id];
                            if (rec) {
                              fetch("/api/apply-records", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: rec.id, stage: v }),
                              })
                                .then((r) => r.json())
                                .then((d) => {
                                  if (d.code === 0)
                                    setApplyRecordMap((prev) => ({
                                      ...prev,
                                      [row.id]: { ...prev[row.id]!, stage: v },
                                    }));
                                });
                            } else {
                              fetch("/api/apply-records", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  source_type: "civil",
                                  civil_post_id: row.id,
                                  stage: v,
                                  job_title: row.title,
                                }),
                              })
                                .then((r) => r.json())
                                .then((d) => {
                                  if (d.code === 0 && d.data)
                                    setApplyRecordMap((prev) => ({
                                      ...prev,
                                      [row.id]: {
                                        id: d.data.id,
                                        stage: v,
                                        remark: null,
                                      },
                                    }));
                                });
                            }
                          }}
                          className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                        >
                          <option value="">进度</option>
                          {STAGES.filter((s) => s !== "全部").map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <span className="text-slate-400">登录后操作</span>
                    )}
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}

        {/* 分页 */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              共 {total} 条，第 {page} / {Math.ceil(total / pageSize) || 1} 页
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
              >
                上一页
              </button>
              <button
                type="button"
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
