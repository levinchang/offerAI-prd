"use client";

import { useEffect, useState } from "react";
import { Table, TableHead, TableBody, Th, Td } from "@/components/ui";

type DictField = { id: number; fieldKey: string; fieldName: string };
type DictItem = { id: number; fieldKey: string; code: string | null; label: string; sortOrder: number; status: string };

export default function AdminDictsPage() {
  const [fields, setFields] = useState<DictField[]>([]);
  const [fieldKey, setFieldKey] = useState("");
  const [items, setItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCode, setNewCode] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/dicts/fields")
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && Array.isArray(d.data)) setFields(d.data);
      });
  }, []);

  useEffect(() => {
    if (!fieldKey) {
      setItems([]);
      return;
    }
    setLoading(true);
    fetch(`/api/admin/dicts/items?field_key=${encodeURIComponent(fieldKey)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0 && Array.isArray(d.data)) setItems(d.data);
        else setItems([]);
      })
      .finally(() => setLoading(false));
  }, [fieldKey]);

  const handleAdd = () => {
    if (!fieldKey || !newLabel.trim()) return;
    setAdding(true);
    fetch("/api/admin/dicts/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field_key: fieldKey, label: newLabel.trim(), code: newCode.trim() || newLabel.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0) {
          setNewLabel("");
          setNewCode("");
          setFieldKey((k) => k);
          fetch(`/api/admin/dicts/items?field_key=${encodeURIComponent(fieldKey)}`)
            .then((r) => r.json())
            .then((res) => { if (res.code === 0 && Array.isArray(res.data)) setItems(res.data); });
        } else alert(d.message || "新增失败");
      })
      .finally(() => setAdding(false));
  };

  const toggleStatus = (item: DictItem) => {
    fetch(`/api/admin/dicts/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: item.status === "active" ? "inactive" : "active" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 0)
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: i.status === "active" ? "inactive" : "active" } : i)));
      });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">字典维护</h1>
      <p className="mt-2 text-slate-600">按 field_key 维护枚举项（M8.2/M8.3）。</p>
      <div className="mt-4 flex items-center gap-3">
        <select
          value={fieldKey}
          onChange={(e) => setFieldKey(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="">选择字段</option>
          {fields.map((f) => (
            <option key={f.id} value={f.fieldKey}>{f.fieldName} ({f.fieldKey})</option>
          ))}
        </select>
      </div>
      {fieldKey && (
        <>
          <div className="mt-4 flex items-center gap-2">
            <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="显示名 label" className="rounded border border-slate-300 px-2 py-1 text-sm w-40" />
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="code（可选）" className="rounded border border-slate-300 px-2 py-1 text-sm w-32" />
            <button type="button" onClick={handleAdd} disabled={adding} className="rounded bg-primary px-3 py-1 text-sm text-white disabled:opacity-50">新增</button>
          </div>
          {loading ? (
            <p className="mt-4 text-slate-500">加载中…</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <Table>
                <TableHead>
                  <Th>ID</Th>
                  <Th>code</Th>
                  <Th>label</Th>
                  <Th>排序</Th>
                  <Th>状态</Th>
                  <Th>操作</Th>
                </TableHead>
                <TableBody>
                  {items.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <Td>{row.id}</Td>
                      <Td>{row.code ?? "—"}</Td>
                      <Td>{row.label}</Td>
                      <Td>{row.sortOrder}</Td>
                      <Td>{row.status}</Td>
                      <Td>
                        <button type="button" onClick={() => toggleStatus(row)} className="text-primary underline">{row.status === "active" ? "停用" : "启用"}</button>
                      </Td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
