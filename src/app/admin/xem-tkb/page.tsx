"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getGiaoVienList, getTKBList } from "@/lib/api";
import type { GiaoVien, TKBSlot } from "@/lib/types";

/* ─── Constants ──────────────────────────────────────────────── */
const DAYS = [
  { thu: 2, label: "Thứ 2" },
  { thu: 3, label: "Thứ 3" },
  { thu: 4, label: "Thứ 4" },
  { thu: 5, label: "Thứ 5" },
  { thu: 6, label: "Thứ 6" },
  { thu: 7, label: "Thứ 7" },
];
const PERIODS = [1, 2, 3, 4, 5];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Toán":        { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  "Ngữ Văn":     { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  "Tiếng Anh":   { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  "KHTN":        { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  "Lịch Sử":    { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  "Địa Lý":     { bg: "#ecfccb", text: "#365314", border: "#a3e635" },
  "GDCD":        { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  "Thể dục":    { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
  "Tin học":     { bg: "#f0f9ff", text: "#0c4a6e", border: "#bae6fd" },
  "Công nghệ":  { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  "Mĩ thuật":   { bg: "#fdf4ff", text: "#701a75", border: "#e879f9" },
  "Âm nhạc":    { bg: "#fff7ed", text: "#9a3412", border: "#fb923c" },
  "Chào cờ":    { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" },
  "HĐTN":       { bg: "#f0fdfa", text: "#115e59", border: "#5eead4" },
  default:       { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};
function getColor(mon: string) {
  return SUBJECT_COLORS[mon] ?? SUBJECT_COLORS.default;
}

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/* ─── Toast ──────────────────────────────────────────────────── */
interface Toast { type: "success" | "error" | "warning"; msg: string }

function ToastBanner({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);

  const cfg = {
    success: { bg: "#dcfce7", bd: "#86efac", fg: "#166534", icon: "check_circle" },
    warning: { bg: "#fef3c7", bd: "#fcd34d", fg: "#92400e", icon: "warning" },
    error:   { bg: "#fee2e2", bd: "#fca5a5", fg: "#991b1b", icon: "error" },
  }[toast.type];

  return (
    <div className="rounded-xl px-4 py-3 flex items-start gap-3 shadow-lg animate-in slide-in-from-top"
      style={{ background: cfg.bg, border: `1px solid ${cfg.bd}`, color: cfg.fg }}>
      <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: 20 }}>{cfg.icon}</span>
      <p className="text-sm font-medium flex-1 whitespace-pre-wrap">{toast.msg}</p>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}

/* ─── DnD API helper ─────────────────────────────────────────── */
async function dndFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  let data: any;
  try { data = await res.json(); } catch { data = {}; }
  return { ok: res.ok, status: res.status, data };
}

/* ─── Drag-and-Drop Grid ─────────────────────────────────────── */
function DnDGrid({
  slots,
  mode,
  gvList,
  onMove,
  onSwap,
}: {
  slots: TKBSlot[];
  mode: "gv" | "lop";
  gvList: GiaoVien[];
  onMove: (slotId: number, thu: number, buoi: string, tiet: number) => Promise<void>;
  onSwap: (aId: number, bId: number) => Promise<void>;
}) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overCell, setOverCell] = useState<string | null>(null);

  const ck = (thu: number, buoi: string, tiet: number) => `${thu}-${buoi}-${tiet}`;

  function handleDragStart(e: React.DragEvent, slot: TKBSlot) {
    if (!slot.id) return;
    setDragId(slot.id);
    e.dataTransfer.setData("text/plain", String(slot.id));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overCell !== key) setOverCell(key);
  }

  function handleDragLeave(e: React.DragEvent) {
    const rel = e.relatedTarget as HTMLElement | null;
    if (!rel || !e.currentTarget.contains(rel)) setOverCell(null);
  }

  async function handleDrop(e: React.DragEvent, thu: number, buoi: string, tiet: number) {
    e.preventDefault();
    setOverCell(null);
    const srcId = parseInt(e.dataTransfer.getData("text/plain"));
    if (!srcId) return;

    const target = slots.find(s => s.thu === thu && s.buoi === buoi && s.tiet === tiet);
    if (target?.id === srcId) { setDragId(null); return; }

    if (target?.id) {
      await onSwap(srcId, target.id);
    } else {
      await onMove(srcId, thu, buoi, tiet);
    }
    setDragId(null);
  }

  function handleDragEnd() { setDragId(null); setOverCell(null); }

  const hasSang = slots.some(s => s.buoi === "sang");
  const hasChieu = slots.some(s => s.buoi === "chieu");
  const buoiList: ("sang" | "chieu")[] =
    hasSang && hasChieu ? ["sang", "chieu"]
    : hasSang ? ["sang"]
    : hasChieu ? ["chieu"]
    : ["sang", "chieu"];

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: 520 }}>
          <thead>
            <tr style={{ background: "var(--color-primary)" }}>
              <th className="p-2.5 text-left font-bold w-16"
                style={{ color: "var(--color-on-primary)", borderRight: "1px solid rgba(255,255,255,.2)" }}>
                Tiết
              </th>
              {DAYS.map((d, i) => (
                <th key={d.thu} className="p-2.5 text-center font-bold"
                  style={{ color: "var(--color-on-primary)", borderRight: i < 4 ? "1px solid rgba(255,255,255,.2)" : undefined }}>
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buoiList.map(buoi => (
              <Fragment key={buoi}>
                <tr>
                  <td colSpan={6} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: buoi === "sang" ? "#eff6ff" : "#f0fdf4",
                      color: buoi === "sang" ? "#1d4ed8" : "#15803d",
                    }}>
                    {buoi === "sang" ? "☀ Buổi Sáng" : "🌤 Buổi Chiều"}
                  </td>
                </tr>
                {PERIODS.map(tiet => (
                  <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                    <td className="p-2 text-center font-bold"
                      style={{
                        color: "var(--color-outline)",
                        background: "var(--color-surface-container-low)",
                        borderRight: "1px solid var(--color-outline-variant)",
                      }}>
                      {tiet}
                    </td>
                    {DAYS.map((d, di) => {
                      const slot = slots.find(s => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                      const key = ck(d.thu, buoi, tiet);
                      const isDragging = slot?.id === dragId;
                      const isOver = overCell === key && dragId !== null;
                      const c = slot ? getColor(slot.mon) : null;

                      return (
                        <td key={d.thu} className="p-1"
                          style={{ borderRight: di < 4 ? "1px solid var(--color-outline-variant)" : undefined }}
                          onDragOver={e => handleDragOver(e, key)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, d.thu, buoi, tiet)}>
                          {slot && c ? (
                            <div
                              draggable
                              onDragStart={e => handleDragStart(e, slot)}
                              onDragEnd={handleDragEnd}
                              className="rounded-lg px-1.5 py-2 text-center cursor-grab active:cursor-grabbing select-none transition-all"
                              style={{
                                background: c.bg,
                                border: isOver ? "2px dashed #f59e0b" : `1px solid ${c.border}`,
                                opacity: isDragging ? 0.3 : 1,
                              }}>
                              <p className="font-black leading-tight truncate" style={{ color: c.text, fontSize: 10 }}>
                                {slot.mon}
                              </p>
                              <p className="font-semibold leading-tight truncate mt-0.5" style={{ color: c.text, fontSize: 9 }}>
                                {mode === "gv"
                                  ? slot.lop
                                  : (gvList.find(g => g.ma_gv === slot.ma_gv)?.ho_ten?.split(" ").pop() ?? slot.ma_gv)}
                              </p>
                            </div>
                          ) : (
                            <div
                              className="min-h-[44px] rounded-lg transition-all"
                              style={{
                                background: isOver ? "rgba(59,130,246,.1)" : "rgba(0,0,0,.02)",
                                border: isOver ? "2px dashed #3b82f6" : "2px solid transparent",
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function XemTKBPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<TKBSlot[]>([]);
  const [gvList, setGvList] = useState<GiaoVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"gv" | "lop">("gv");
  const [selected, setSelected] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [fromGv, setFromGv] = useState<string | null>(null); // param ?gv=

  const loadData = useCallback(async () => {
    try {
      const [s, g] = await Promise.all([getTKBList(), getGiaoVienList()]);
      setSlots(s);
      setGvList(g);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  // Đọc ?gv= từ URL, pre-select và lưu để hiển thị nút back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gv = params.get("gv");
    if (gv) {
      setFromGv(gv);
      setTab("gv");
      setSelected(gv);
    }
  }, []);

  const gvCodes = Array.from(new Set(slots.map(s => s.ma_gv))).sort();
  const lopCodes = Array.from(new Set(slots.map(s => s.lop))).sort();
  const filtered = tab === "gv"
    ? slots.filter(s => s.ma_gv === selected)
    : slots.filter(s => s.lop === selected);
  const gvInfo = tab === "gv" ? gvList.find(g => g.ma_gv === selected) : null;

  /* ─── DnD handlers ─── */
  function showResult(res: { ok: boolean; status: number; data: any }, actionLabel: string) {
    if (res.status === 422) {
      const cbs = (res.data?.detail?.canh_bao ?? []) as any[];
      const msgs = cbs.map((c: any) => `[${(c.loai ?? "").toUpperCase()}] ${c.mo_ta}`).join("\n");
      setToast({ type: "error", msg: msgs || `Vi phạm ràng buộc — không thể ${actionLabel}.` });
      return false;
    }
    if (!res.ok) {
      setToast({ type: "error", msg: typeof res.data?.detail === "string" ? res.data.detail : `Lỗi ${actionLabel}.` });
      return false;
    }
    const soft = ((res.data?.canh_bao ?? []) as any[]).filter((c: any) => c.loai === "soft");
    if (soft.length > 0) {
      setToast({ type: "warning", msg: soft.map((c: any) => `⚠ ${c.mo_ta}`).join("\n") });
    } else {
      setToast({ type: "success", msg: `Đã ${actionLabel} thành công.` });
    }
    return true;
  }

  async function handleMove(slotId: number, thu: number, buoi: string, tiet: number) {
    const res = await dndFetch("PUT", `/api/tkb/slot/${slotId}`, { thu, buoi, tiet });
    if (showResult(res, "di chuyển")) await loadData();
  }

  async function handleSwap(aId: number, bId: number) {
    const res = await dndFetch("POST", "/api/tkb/slot/swap", { slot_a_id: aId, slot_b_id: bId });
    if (showResult(res, "hoán đổi")) await loadData();
  }

  /* ─── Render ─── */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Đang tải TKB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Xem thời khoá biểu</h1>
        <div className="rounded-xl p-4 text-sm" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
          {error}
        </div>
        <button onClick={() => { setLoading(true); setError(""); void loadData(); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          Thử lại
        </button>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Xem thời khoá biểu</h1>
        <div className="rounded-xl p-10 text-center" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined mb-2" style={{ fontSize: 48 }}>event_busy</span>
          <p className="font-medium">Chưa có TKB nào. Hãy tạo TKB trước.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <ToastBanner toast={toast} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {fromGv && (
            <button
              onClick={() => router.push("/admin/giao-vien")}
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-2 hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-primary)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Quay lại danh sách giáo viên
            </button>
          )}
          <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            Xem thời khoá biểu
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kéo thả ô để di chuyển hoặc hoán đổi tiết. Hệ thống tự kiểm tra ràng buộc.
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--color-on-surface-variant)" }}>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
          {gvCodes.length} giáo viên
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>class</span>
          {lopCodes.length} lớp
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>event</span>
          {slots.length} tiết
        </span>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "var(--color-surface-container)" }}>
        {(["gv", "lop"] as const).map(t => (
          <button key={t}
            onClick={() => { setTab(t); setSelected(""); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t ? "var(--color-primary)" : "transparent",
              color: tab === t ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{t === "gv" ? "person" : "class"}</span>
            {t === "gv" ? "Theo giáo viên" : "Theo lớp"}
          </button>
        ))}
      </div>

      {/* Selector */}
      <div className="space-y-2">
        <select
          className="w-full max-w-xs px-3 py-2 rounded-xl text-sm border-none outline-none"
          style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
          value={selected}
          onChange={e => setSelected(e.target.value)}>
          <option value="">-- {tab === "gv" ? "Chọn giáo viên" : "Chọn lớp"} --</option>
          {(tab === "gv" ? gvCodes : lopCodes).map(code => {
            const label = tab === "gv"
              ? (() => { const g = gvList.find(x => x.ma_gv === code); return g ? `${g.ho_ten} (${code})` : code; })()
              : code;
            return <option key={code} value={code}>{label}</option>;
          })}
        </select>

        <div className="flex flex-wrap gap-1.5">
          {(tab === "gv" ? gvCodes : lopCodes).map(code => {
            const label = tab === "gv"
              ? (gvList.find(g => g.ma_gv === code)?.ho_ten?.split(" ").pop() ?? code)
              : code;
            return (
              <button key={code} onClick={() => setSelected(code)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: selected === code ? "var(--color-primary)" : "var(--color-surface-container)",
                  color: selected === code ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info bar */}
      {tab === "gv" && gvInfo && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
          style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
          <span className="font-bold">{gvInfo.ho_ten}</span>
          <span className="opacity-70">· {gvInfo.to_chuyen_mon ?? "—"}</span>
          {gvInfo.chuc_vu && <span className="opacity-70">· {gvInfo.chuc_vu}</span>}
          <span className="ml-auto font-bold">{filtered.length} tiết/tuần</span>
        </div>
      )}
      {tab === "lop" && selected && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
          style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>class</span>
          <span className="font-bold">Lớp {selected}</span>
          <span className="ml-auto font-bold">{filtered.length} tiết/tuần</span>
        </div>
      )}

      {/* Grid or empty state */}
      {selected && filtered.length > 0 ? (
        <DnDGrid slots={filtered} mode={tab} gvList={gvList} onMove={handleMove} onSwap={handleSwap} />
      ) : selected ? (
        <div className="py-8 text-center rounded-xl" style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
          <span className="material-symbols-outlined mb-2" style={{ fontSize: 32 }}>event_busy</span>
          <p className="text-sm font-medium">Không có tiết nào.</p>
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl" style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
          <span className="material-symbols-outlined mb-3" style={{ fontSize: 40 }}>
            {tab === "gv" ? "person_search" : "class"}
          </span>
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
            {tab === "gv" ? "Chọn giáo viên để xem lịch dạy" : "Chọn lớp để xem thời khoá biểu"}
          </p>
        </div>
      )}

      {/* Legend */}
      {selected && filtered.length > 0 && (
        <div className="flex flex-wrap gap-3 text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>
          <span className="font-semibold">Thao tác:</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded" style={{ border: "2px dashed #3b82f6", background: "rgba(59,130,246,.1)" }} />
            Kéo vào ô trống = di chuyển
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded" style={{ border: "2px dashed #f59e0b" }} />
            Kéo vào ô có tiết = hoán đổi
          </span>
        </div>
      )}
    </div>
  );
}
