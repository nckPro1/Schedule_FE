"use client";

import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGvSession, clearGvSession } from "@/lib/mock-auth";
import { MOCK_TKB, MOCK_PHAN_CONG } from "@/lib/mock-data";
import {
  getAttendancePhase,
  getCurrentTimeStr,
  getCurrentThu,
  getDateForThu,
  getDateForThuWithOffset,
  getPeriodTime,
  setDevMode,
  clearDevMode,
  getDevMode,
  THU_LABELS,
} from "@/lib/time-utils";
import { getAllRecords, updateGhiChu } from "@/lib/attendance-store";
import type { GvAccount, DiemDanhRecord, TrangThaiDiemDanh } from "@/lib/types";

const DAYS = [
  { thu: 2, label: "T2" },
  { thu: 3, label: "T3" },
  { thu: 4, label: "T4" },
  { thu: 5, label: "T5" },
  { thu: 6, label: "T6" },
  { thu: 7, label: "T7" },
];
const PERIODS = [1, 2, 3, 4, 5];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Toán":       { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  "Ngữ Văn":   { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  "Tiếng Anh": { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  "KHTN":       { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  "Lịch Sử":  { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  "Địa Lý":   { bg: "#ecfccb", text: "#365314", border: "#a3e635" },
  "GDCD":       { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  "Thể dục":  { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
  default:      { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};
function getColor(mon: string) { return SUBJECT_COLORS[mon] ?? SUBJECT_COLORS.default; }

// ─── Badge trạng thái điểm danh ───────────────────────────────────────────────

const STATUS_CONFIG: Record<TrangThaiDiemDanh | "open" | "checkout" | "today_locked", {
  label: string; bg: string; text: string; icon: string;
}> = {
  dung_gio:       { label: "Đúng giờ",    bg: "#dcfce7", text: "#166534", icon: "check_circle" },
  muon:           { label: "Muộn",        bg: "#fef3c7", text: "#92400e", icon: "schedule" },
  tre:            { label: "Trễ",         bg: "#ffedd5", text: "#7c2d12", icon: "warning" },
  vang_mat:       { label: "Vắng",        bg: "#fee2e2", text: "#991b1b", icon: "cancel" },
  chua_diem_danh: { label: "Chưa ĐD",    bg: "#f3f4f6", text: "#6b7280", icon: "radio_button_unchecked" },
  open:           { label: "Điểm danh vào", bg: "#dbeafe", text: "#1e3a8a", icon: "fingerprint" },
  checkout:       { label: "Điểm danh ra", bg: "#d1fae5", text: "#065f46", icon: "door_open" },
  today_locked:   { label: "Đã khoá",    bg: "#fee2e2", text: "#991b1b", icon: "lock" },
};

// ─── Toast config ──────────────────────────────────────────────────────────────

function getToastConfig(ok: string): { message: string; bg: string; text: string; icon: string } {
  switch (ok) {
    case "dung_gio":    return { message: "Điểm danh đúng giờ thành công!", bg: "#dcfce7", text: "#166534", icon: "check_circle" };
    case "muon":        return { message: "Điểm danh muộn đã được ghi nhận.", bg: "#fef3c7", text: "#92400e", icon: "schedule" };
    case "tre":         return { message: "Điểm danh trễ đã được ghi nhận.", bg: "#ffedd5", text: "#7c2d12", icon: "warning" };
    case "vang_mat":    return { message: "Đã ghi nhận vắng mặt tự động.", bg: "#fee2e2", text: "#991b1b", icon: "cancel" };
    case "checkout_ok": return { message: "Điểm danh ra thành công!", bg: "#d1fae5", text: "#065f46", icon: "door_open" };
    default:            return { message: "Điểm danh đã được ghi nhận.", bg: "#dbeafe", text: "#1e3a8a", icon: "fingerprint" };
  }
}

// ─── Modal TKB lớp chủ nhiệm ──────────────────────────────────────────────────

const SUBJECT_COLORS_LOP: Record<string, { bg: string; text: string }> = {
  "Toán":       { bg: "#dbeafe", text: "#1e3a8a" },
  "Ngữ Văn":   { bg: "#fce7f3", text: "#831843" },
  "Tiếng Anh": { bg: "#d1fae5", text: "#064e3b" },
  "KHTN":       { bg: "#ffedd5", text: "#7c2d12" },
  "Lịch Sử":  { bg: "#fef9c3", text: "#713f12" },
  "Địa Lý":   { bg: "#ecfccb", text: "#365314" },
  "GDCD":       { bg: "#ede9fe", text: "#4c1d95" },
  "Thể dục":  { bg: "#e0f2fe", text: "#075985" },
  "Tin học":   { bg: "#f0f9ff", text: "#0c4a6e" },
  "Chào cờ":  { bg: "#fef2f2", text: "#991b1b" },
  default:      { bg: "#f3f4f6", text: "#374151" },
};

const LOP_DAYS    = [{ thu: 2, label: "T2" }, { thu: 3, label: "T3" }, { thu: 4, label: "T4" }, { thu: 5, label: "T5" }, { thu: 6, label: "T6" }, { thu: 7, label: "T7" }];
const LOP_PERIODS = [1, 2, 3, 4, 5];

function LopChuNhiemModal({ tenLop, maGvCN, onClose }: { tenLop: string; maGvCN: string; onClose: () => void }) {
  const slots = MOCK_TKB.filter((s) => s.lop === tenLop);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl overflow-hidden flex flex-col"
        style={{
          maxWidth: 680,
          maxHeight: "90vh",
          background: "var(--color-surface-container-lowest)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <div>
            <p className="font-bold text-base">TKB Lớp {tenLop}</p>
            <p className="text-xs opacity-75 mt-0.5">Toàn bộ môn học · ★ = tiết bạn dạy</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-auto p-4">
          {slots.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "var(--color-outline)" }}>
              Lớp {tenLop} chưa có tiết nào trong TKB hiện tại.
            </p>
          ) : (
            <table className="w-full text-xs" style={{ minWidth: 480 }}>
              <thead>
                <tr style={{ background: "var(--color-surface-container-low)" }}>
                  <th className="py-2 px-2 text-left font-bold w-14"
                    style={{ color: "var(--color-outline)", borderRight: "1px solid var(--color-outline-variant)" }}>
                    Tiết
                  </th>
                  {LOP_DAYS.map((d) => (
                    <th key={d.thu} className="py-2 px-1 text-center font-bold"
                      style={{ color: "var(--color-on-surface)", borderRight: "1px solid var(--color-outline-variant)" }}>
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["sang", "chieu"] as const).map((buoi) => (
                  <Fragment key={buoi}>
                    <tr>
                      <td colSpan={7} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                        style={{
                          background: buoi === "sang" ? "#eff6ff" : "#f0fdf4",
                          color:      buoi === "sang" ? "#1d4ed8"  : "#15803d",
                        }}>
                        {buoi === "sang" ? "☀ Sáng" : "🌤 Chiều"}
                      </td>
                    </tr>
                    {LOP_PERIODS.map((tiet) => {
                      const pt = getPeriodTime(buoi, tiet);
                      return (
                        <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                          <td className="py-1.5 px-2 text-center font-mono"
                            style={{
                              color: "var(--color-outline)",
                              background: "var(--color-surface-container-low)",
                              borderRight: "1px solid var(--color-outline-variant)",
                            }}>
                            <p className="font-bold">{tiet}</p>
                            <p className="text-[9px]">{pt.start}</p>
                          </td>
                          {LOP_DAYS.map((d) => {
                            const slot = slots.find((s) => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                            if (!slot) {
                              return (
                                <td key={d.thu} className="py-1.5 px-1"
                                  style={{ borderRight: "1px solid var(--color-outline-variant)" }}>
                                  <div className="h-11 rounded"
                                    style={{ background: "var(--color-surface-container-low)", opacity: 0.35 }} />
                                </td>
                              );
                            }
                            const c     = SUBJECT_COLORS_LOP[slot.mon] ?? SUBJECT_COLORS_LOP.default;
                            const isOwn = slot.ma_gv === maGvCN;
                            return (
                              <td key={d.thu} className="py-1.5 px-1"
                                style={{ borderRight: "1px solid var(--color-outline-variant)" }}>
                                <div
                                  className="h-11 rounded px-1.5 py-1 flex flex-col justify-center"
                                  style={{
                                    background: c.bg,
                                    outline: isOwn ? `2px solid ${c.text}` : undefined,
                                    outlineOffset: isOwn ? "-2px" : undefined,
                                  }}
                                >
                                  <p className="font-bold leading-tight truncate" style={{ color: c.text, fontSize: 9 }}>
                                    {slot.mon}{isOwn ? " ★" : ""}
                                  </p>
                                  <p className="leading-tight truncate mt-0.5" style={{ color: c.text, fontSize: 9, opacity: 0.7 }}>
                                    {slot.ma_gv}
                                  </p>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 pb-4 shrink-0">
          <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>
            ★ Tiết bạn dạy &nbsp;·&nbsp; Viền đậm = môn của bạn &nbsp;·&nbsp; Mã GV hiển thị trong ô
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dev Mode Panel ────────────────────────────────────────────────────────────

function DevModePanel({ onRefresh }: { onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [thu, setThu] = useState(2);
  const [time, setTime] = useState("07:00");
  const dev = getDevMode();

  function apply() { setDevMode(thu, time); onRefresh(); }
  function reset() { clearDevMode(); onRefresh(); }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-white text-xs font-bold transition-all hover:scale-110"
        style={{ background: dev ? "#7c3aed" : "#6b7280" }}
        title="Dev Mode"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>developer_mode</span>
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 w-64 rounded-2xl p-4 shadow-xl"
          style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
          <p className="text-xs font-bold mb-3 flex items-center gap-1" style={{ color: "#7c3aed" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>developer_mode</span>
            Dev Mode — Giả lập giờ
          </p>
          {dev && (
            <p className="text-xs mb-3 px-2 py-1.5 rounded-lg" style={{ background: "#f3e8ff", color: "#6d28d9" }}>
              Đang giả lập: {THU_LABELS[dev.thu]} — {dev.time}
            </p>
          )}
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Thứ</label>
              <select
                value={thu}
                onChange={(e) => setThu(Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded-lg text-xs"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)" }}
              >
                {Object.entries(THU_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Giờ (HH:MM)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 rounded-lg text-xs"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)" }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={apply}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "#7c3aed" }}>
              Áp dụng
            </button>
            <button onClick={reset}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trang chính ───────────────────────────────────────────────────────────────

export default function LichPage() {
  const router = useRouter();
  const [gv, setGv] = useState<GvAccount | null>(null);
  const [now, setNow] = useState({ thu: 0, time: "" });
  const [records, setRecords] = useState<DiemDanhRecord[]>([]);
  const [tick, setTick] = useState(0);

  // UI state
  const [weekOffset, setWeekOffset] = useState(0);
  const [toast, setToast] = useState<{ message: string; bg: string; text: string; icon: string } | null>(null);
  const [giaiTrinhId, setGiaiTrinhId] = useState<string | null>(null);
  const [giaiTrinhText, setGiaiTrinhText] = useState("");
  const [showLopModal, setShowLopModal] = useState(false);

  const notifiedRef = useRef<Set<string>>(new Set());
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Auth check
  useEffect(() => {
    const session = getGvSession();
    if (!session) { router.replace("/login-gv"); return; }
    setGv(session);
  }, [router]);

  // Cập nhật giờ mỗi 30s
  useEffect(() => {
    function update() {
      setNow({ thu: getCurrentThu(), time: getCurrentTimeStr() });
      setRecords(getAllRecords());
    }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [tick]);

  // Toast từ URL param ?ok=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ok = params.get("ok");
    if (ok) {
      setToast(getToastConfig(ok));
      window.history.replaceState({}, "", "/lich");
      const tid = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(tid);
    }
  }, []);

  // Xin quyền thông báo trình duyệt
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Nhắc nhở điểm danh 5 phút trước khi bắt đầu tiết
  useEffect(() => {
    if (!gv) return;
    function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

    const id = setInterval(() => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const curThu = getCurrentThu();
      const curTime = getCurrentTimeStr();
      const curMin = toMin(curTime);

      MOCK_TKB
        .filter((s) => s.ma_gv === gv.ma_gv && s.thu === curThu)
        .forEach((slot) => {
          const pt = getPeriodTime(slot.buoi, slot.tiet);
          const startMin = toMin(pt.start);
          const minutesLeft = startMin - curMin;
          const key = `${slot.id}-${getDateForThu(slot.thu)}`;
          if (minutesLeft > 4 && minutesLeft <= 5 && !notifiedRef.current.has(key)) {
            notifiedRef.current.add(key);
            new Notification("⏰ Sắp đến tiết học", {
              body: `Tiết ${slot.tiet} ${slot.buoi === "sang" ? "sáng" : "chiều"} — ${slot.lop} (${slot.mon}) bắt đầu lúc ${pt.start}`,
              icon: "/favicon.ico",
              tag: key,
            });
          }
        });
    }, 60_000);

    return () => clearInterval(id);
  }, [gv]);

  function handleLogout() {
    clearGvSession();
    router.push("/");
  }

  function submitGiaiTrinh() {
    if (!giaiTrinhId || !giaiTrinhText.trim()) return;
    updateGhiChu(giaiTrinhId, giaiTrinhText.trim());
    setRecords(getAllRecords());
    setGiaiTrinhId(null);
    setGiaiTrinhText("");
  }

  if (!gv) return null;

  const mySlots = MOCK_TKB.filter((s) => s.ma_gv === gv.ma_gv);
  const myPc    = MOCK_PHAN_CONG.filter((p) => p.ma_gv === gv.ma_gv);
  const tongTiet = myPc.reduce((s, p) => s + p.so_tiet_tuan, 0);

  const myRecords = records.filter((r) => r.ma_gv === gv.ma_gv);

  // Ngày cho tuần đang xem
  const weekDates = DAYS.map((d) => getDateForThuWithOffset(d.thu, weekOffset));
  const weekLabel = weekOffset === 0
    ? "Tuần này"
    : weekOffset === -1
    ? "Tuần trước"
    : `${Math.abs(weekOffset)} tuần trước`;

  // Lịch sử tuần đang xem
  const weekRecords = myRecords
    .filter((r) => weekDates.includes(r.ngay))
    .sort((a, b) => (b.ngay + b.buoi + String(b.tiet)).localeCompare(a.ngay + a.buoi + String(a.tiet)));

  // Stats theo tuần đang xem (nhất quán với bảng lịch sử)
  const stats = {
    dung_gio: weekRecords.filter((r) => r.trang_thai === "dung_gio").length,
    muon:     weekRecords.filter((r) => r.trang_thai === "muon").length,
    tre:      weekRecords.filter((r) => r.trang_thai === "tre").length,
    vang_mat: weekRecords.filter((r) => r.trang_thai === "vang_mat").length,
  };

  function getRecord(slot_id: number, thu: number): DiemDanhRecord | null {
    // Luôn tra theo tuần hiện tại (grid TKB luôn là tuần này)
    const ngay = getDateForThu(thu);
    return records.find((r) => r.slot_id === slot_id && r.ngay === ngay) ?? null;
  }

  /** Xác định trạng thái hiển thị của 1 slot */
  function getSlotStatus(slot: { id?: number; thu: number; buoi: "sang" | "chieu"; tiet: number }): {
    key: keyof typeof STATUS_CONFIG;
    clickable: boolean;
    isToday: boolean;
  } {
    const isToday = slot.thu === now.thu;
    const rec = slot.id != null ? getRecord(slot.id, slot.thu) : null;

    if (rec) {
      if (!rec.da_diem_danh_ra && isToday) {
        const phase = getAttendancePhase(slot.buoi, slot.tiet, now.time);
        // Phân biệt: checkout_ready → badge "Điểm danh ra" (xanh lá)
        if (phase.phase === "checkout_ready") return { key: "checkout", clickable: true, isToday };
        // Trong giờ vào nhưng đã check-in rồi, chờ checkout
        if (phase.phase === "locked" || phase.phase === "open")
          return { key: rec.trang_thai, clickable: false, isToday };
      }
      return { key: rec.trang_thai, clickable: false, isToday };
    }

    if (!isToday) {
      const slotDate = new Date(getDateForThu(slot.thu));
      const today = new Date(getDateForThu(now.thu || getCurrentThu()));
      if (slotDate > today) return { key: "chua_diem_danh", clickable: false, isToday: false };
      return { key: "chua_diem_danh", clickable: false, isToday: false };
    }

    // Hôm nay, chưa có record
    const phase = getAttendancePhase(slot.buoi, slot.tiet, now.time);
    if (phase.phase === "too_early")    return { key: "chua_diem_danh", clickable: false, isToday: true };
    if (phase.phase === "period_ended") return { key: "chua_diem_danh", clickable: false, isToday: true };
    if (phase.phase === "locked")       return { key: "today_locked",   clickable: false, isToday: true };
    return { key: "open", clickable: true, isToday: true };
  }


  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-4"
        style={{ background: "var(--color-surface-container-lowest)", borderBottom: "1px solid var(--color-outline-variant)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>school</span>
          </div>
          <div className="min-w-0">
            <p className="font-headline font-bold text-sm truncate" style={{ color: "var(--color-on-surface)" }}>
              {gv.ho_ten}
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--color-outline)" }}>
              {gv.to_chuyen_mon} · {gv.ma_gv}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {now.time && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold"
              style={{ background: getDevMode() ? "#f3e8ff" : "var(--color-surface-container)", color: getDevMode() ? "#7c3aed" : "var(--color-on-surface-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
              {getDevMode() ? `[DEV] ${THU_LABELS[now.thu]} ` : ""}{now.time}
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
            style={{ color: "var(--color-error)", background: "var(--color-error-container)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>logout</span>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-5">

        {/* Thông tin GV */}
        <div className="rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4"
          style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Tổ chuyên môn</p>
            <p className="font-bold mt-0.5 text-sm" style={{ color: "var(--color-on-surface)" }}>{gv.to_chuyen_mon}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Lớp chủ nhiệm</p>
            {gv.lop_chu_nhiem ? (
              <button
                onClick={() => setShowLopModal(true)}
                className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-1 rounded-lg text-sm font-bold transition-all hover:opacity-80 hover:scale-[1.03]"
                style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
                title="Xem TKB lớp này"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>school</span>
                {gv.lop_chu_nhiem}
                <span className="material-symbols-outlined" style={{ fontSize: 13, opacity: 0.7 }}>open_in_new</span>
              </button>
            ) : (
              <p className="font-bold mt-0.5 text-sm" style={{ color: "var(--color-on-surface)" }}>—</p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Tổng tiết / tuần</p>
            <p className="font-bold mt-0.5 text-sm" style={{ color: "var(--color-on-surface)" }}>{tongTiet} tiết</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Tuần học</p>
            <p className="font-bold mt-0.5 text-sm" style={{ color: "var(--color-on-surface)" }}>Tuần 28 (2025–2026)</p>
          </div>
        </div>

        {/* Thống kê cá nhân */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Đúng giờ",  count: stats.dung_gio, bg: "#dcfce7", text: "#166534", icon: "check_circle" },
            { label: "Muộn",      count: stats.muon,     bg: "#fef3c7", text: "#92400e", icon: "schedule" },
            { label: "Trễ",       count: stats.tre,      bg: "#ffedd5", text: "#7c2d12", icon: "warning" },
            { label: "Vắng mặt", count: stats.vang_mat, bg: "#fee2e2", text: "#991b1b", icon: "cancel" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: s.bg, border: `1px solid ${s.text}22` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: s.text, opacity: 0.8 }}>{s.icon}</span>
              <div>
                <p className="text-2xl font-black leading-none" style={{ color: s.text }}>{s.count}</p>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.text, opacity: 0.8 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {(["open", "checkout", "dung_gio", "muon", "tre", "vang_mat", "chua_diem_danh"] as const).map((k) => {
            const cfg = STATUS_CONFIG[k];
            return (
              <span key={k} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: cfg.bg, color: cfg.text }}>
                <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{cfg.icon}</span>
                {cfg.label}
              </span>
            );
          })}
        </div>

        {/* TKB Grid */}
        <div>
          <h2 className="text-lg font-headline font-bold mb-3" style={{ color: "var(--color-on-surface)" }}>
            Thời khóa biểu cá nhân
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 480 }}>
                <thead>
                  <tr style={{ background: "var(--color-primary)" }}>
                    <th className="p-2 text-left font-bold w-14"
                      style={{ color: "var(--color-on-primary)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>Tiết</th>
                    {DAYS.map((d, i) => {
                      const isToday = d.thu === now.thu;
                      return (
                        <th key={d.thu} className="p-2 text-center font-bold"
                          style={{
                            color: "var(--color-on-primary)",
                            borderRight: i < 5 ? "1px solid rgba(255,255,255,0.2)" : undefined,
                            background: isToday ? "rgba(255,255,255,0.15)" : undefined,
                          }}>
                          {d.label}
                          {isToday && <span className="ml-1 text-[9px] opacity-80">(Hôm nay)</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(["sang", "chieu"] as const).map((buoi) => (
                    <Fragment key={buoi}>
                      <tr>
                        <td colSpan={7} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                          style={{
                            background: buoi === "sang" ? "#eff6ff" : "#f0fdf4",
                            color: buoi === "sang" ? "#1d4ed8" : "#15803d",
                          }}>
                          {buoi === "sang" ? "☀ Buổi Sáng" : "🌤 Buổi Chiều"}
                        </td>
                      </tr>
                      {PERIODS.map((tiet) => {
                        const pt = getPeriodTime(buoi, tiet);
                        return (
                          <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                            <td className="p-1.5 text-center"
                              style={{
                                color: "var(--color-outline)",
                                background: "var(--color-surface-container-low)",
                                borderRight: "1px solid var(--color-outline-variant)",
                              }}>
                              <p className="font-bold">{tiet}</p>
                              <p className="text-[9px]">{pt.start}</p>
                            </td>
                            {DAYS.map((d, di) => {
                              const slot = mySlots.find((s) => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                              const isColToday = d.thu === now.thu;

                              if (!slot) {
                                return (
                                  <td key={d.thu} className="p-1"
                                    style={{
                                      borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined,
                                      background: isColToday ? "rgba(0,35,111,0.03)" : undefined,
                                    }}>
                                    <div className="min-h-13 rounded-lg"
                                      style={{ background: isColToday ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.01)" }} />
                                  </td>
                                );
                              }

                              const c = getColor(slot.mon);
                              const status = getSlotStatus(slot);
                              const cfg = STATUS_CONFIG[status.key];

                              return (
                                <td key={d.thu} className="p-1"
                                  style={{
                                    borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined,
                                    background: isColToday ? "rgba(0,35,111,0.03)" : undefined,
                                  }}>
                                  <button
                                    disabled={!status.clickable}
                                    onClick={() => status.clickable && slot.id && router.push(`/gv/diem-danh/${slot.id}`)}
                                    className={`w-full rounded-lg px-1.5 py-2 text-center transition-all ${status.clickable ? "hover:scale-[1.04] hover:shadow-md cursor-pointer" : "cursor-default"}`}
                                    style={{
                                      background: c.bg,
                                      border: `2px solid ${status.isToday ? (status.clickable ? c.border : "transparent") : c.border}`,
                                      outline: status.clickable ? `2px solid ${c.border}` : undefined,
                                    }}
                                  >
                                    <p className="font-black leading-tight truncate" style={{ color: c.text, fontSize: 9 }}>{slot.mon}</p>
                                    <p className="font-bold leading-tight mt-0.5" style={{ color: c.text, fontSize: 10 }}>{slot.lop}</p>
                                    <span
                                      className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full"
                                      style={{ background: cfg.bg, color: cfg.text, fontSize: 8 }}
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: 9 }}>{cfg.icon}</span>
                                      {cfg.label}
                                    </span>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lịch sử điểm danh theo tuần */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
              Lịch sử điểm danh
              <span className="ml-2 text-sm font-medium" style={{ color: "var(--color-outline)" }}>({weekLabel})</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                disabled={weekOffset <= -8}
                className="p-1.5 rounded-lg text-sm disabled:opacity-40"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                title="Tuần trước"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
              </button>
              <button
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Tuần này
              </button>
              <button
                onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
                disabled={weekOffset >= 0}
                className="p-1.5 rounded-lg text-sm disabled:opacity-40"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                title="Tuần sau"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
              </button>
            </div>
          </div>

          {weekRecords.length === 0 ? (
            <div className="rounded-xl p-6 text-center text-sm" style={{ background: "var(--color-surface-container-lowest)", color: "var(--color-outline)" }}>
              Không có dữ liệu điểm danh {weekLabel.toLowerCase()}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--color-surface-container-low)" }}>
                    {["Ngày", "Tiết", "Lớp / Môn", "Vào", "Ra", "Trạng thái", ""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-outline)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekRecords.map((rec) => {
                    const cfg = STATUS_CONFIG[rec.trang_thai];
                    const canGiaiTrinh = ["vang_mat", "muon", "tre"].includes(rec.trang_thai) && !rec.da_giai_trinh;
                    const isExpanded = giaiTrinhId === rec.id;
                    return (
                      <Fragment key={rec.id}>
                        <tr style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                          <td className="px-3 py-2 font-mono text-xs">{rec.ngay}</td>
                          <td className="px-3 py-2 text-xs whitespace-nowrap">{THU_LABELS[rec.thu]} T{rec.tiet} {rec.buoi === "sang" ? "S" : "C"}</td>
                          <td className="px-3 py-2">
                            <p className="font-semibold text-xs">{rec.lop}</p>
                            <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>{rec.mon}</p>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {rec.thoi_gian_vao
                              ? new Date(rec.thoi_gian_vao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {rec.thoi_gian_ra
                              ? new Date(rec.thoi_gian_ra).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: cfg.bg, color: cfg.text }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{cfg.icon}</span>
                              {cfg.label}
                            </span>
                            {rec.da_giai_trinh && !rec.xu_ly_giai_trinh && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
                                Chờ xử lý
                              </span>
                            )}
                            {rec.xu_ly_giai_trinh === "chap_nhan" && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>
                                Đã chấp nhận
                              </span>
                            )}
                            {rec.xu_ly_giai_trinh === "tu_choi" && (
                              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#991b1b" }}>
                                Bị từ chối
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {canGiaiTrinh && (
                              <button
                                onClick={() => { setGiaiTrinhId(isExpanded ? null : rec.id); setGiaiTrinhText(rec.ghi_chu ?? ""); }}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap"
                                style={{ background: isExpanded ? "var(--color-surface-container-high)" : "#dbeafe", color: isExpanded ? "var(--color-on-surface)" : "#1e3a8a" }}
                              >
                                {isExpanded ? "Đóng" : "Giải trình"}
                              </button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr style={{ borderTop: "1px solid var(--color-outline-variant)", background: "#f8faff" }}>
                            <td colSpan={7} className="px-4 py-3">
                              {rec.xu_ly_giai_trinh === "tu_choi" && rec.admin_phan_hoi && (
                                <div className="mb-2 px-3 py-2 rounded-lg text-xs" style={{ background: "#fee2e2", color: "#991b1b" }}>
                                  <span className="font-bold">Phản hồi từ ban giám hiệu: </span>{rec.admin_phan_hoi}
                                </div>
                              )}
                              <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-on-surface)" }}>
                                Lý do:
                              </p>
                              <textarea
                                value={giaiTrinhText}
                                onChange={(e) => setGiaiTrinhText(e.target.value)}
                                rows={2}
                                placeholder="Nhập lý do (ví dụ: bị ốm, công việc đột xuất...)"
                                className="w-full text-xs px-3 py-2 rounded-lg resize-none"
                                style={{
                                  border: "1px solid var(--color-outline-variant)",
                                  background: "var(--color-surface-container-lowest)",
                                  color: "var(--color-on-surface)",
                                }}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={submitGiaiTrinh}
                                  disabled={!giaiTrinhText.trim()}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                                  style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
                                >
                                  Gửi giải trình
                                </button>
                                <button
                                  onClick={() => setGiaiTrinhId(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs"
                                  style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                                >
                                  Hủy
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="flex justify-center pb-8">
          <Link href="/" className="text-sm font-medium inline-flex items-center gap-1 hover:underline"
            style={{ color: "var(--color-outline)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
            Trang chủ
          </Link>
        </div>
      </div>

      {/* Toast thông báo */}
      {toast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold"
          style={{ background: toast.bg, color: toast.text, border: `1px solid ${toast.text}33` }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{toast.icon}</span>
          {toast.message}
        </div>
      )}

      {/* Dev Mode Panel */}
      <DevModePanel onRefresh={refresh} />

      {/* Modal TKB lớp chủ nhiệm */}
      {showLopModal && gv.lop_chu_nhiem && (
        <LopChuNhiemModal
          tenLop={gv.lop_chu_nhiem}
          maGvCN={gv.ma_gv}
          onClose={() => setShowLopModal(false)}
        />
      )}
    </div>
  );
}
