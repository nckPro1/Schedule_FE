"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getGiaoVienByMa, getTKBByMaGv, getPhanCongByMaGv, getTKBByLop, lopHocMock } from "@/lib/mock-data";
import type { TKBSlot } from "@/lib/types";

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
  "Toán":       { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  "Ngữ Văn":    { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  "Tiếng Anh":  { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  "KHTN":       { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  "Lịch Sử":   { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  "Địa Lý":    { bg: "#ecfccb", text: "#365314", border: "#a3e635" },
  "GDCD":       { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  default:      { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};
function getSubjectColor(mon: string) {
  return SUBJECT_COLORS[mon] ?? SUBJECT_COLORS.default;
}

// ─── Shared TKB Grid ──────────────────────────────────────────────────────────
function TKBGrid({ slots, mode }: { slots: TKBSlot[]; mode: "gv" | "lop" }) {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)", border: "1px solid var(--color-outline-variant)" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 600 }}>
          <thead>
            <tr style={{ background: "var(--color-primary)" }}>
              <th className="p-3 text-left text-xs font-bold uppercase tracking-wider w-[80px]"
                style={{ color: "var(--color-on-primary)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                Buổi/Tiết
              </th>
              {DAYS.map((d, i) => (
                <th key={d.thu} className="p-3 text-center text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--color-on-primary)", borderRight: i < 5 ? "1px solid rgba(255,255,255,0.2)" : undefined }}>
                  {d.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(["sang", "chieu"] as const).map((buoi) => (
              <>
                <tr key={`hdr-${buoi}`}>
                  <td colSpan={7} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: buoi === "sang" ? "#eff6ff" : "#f0fdf4", color: buoi === "sang" ? "#1d4ed8" : "#15803d" }}>
                    {buoi === "sang" ? "☀ Buổi Sáng" : "🌤 Buổi Chiều"}
                  </td>
                </tr>
                {PERIODS.map((tiet) => (
                  <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                    <td className="p-3 text-center font-bold text-xs"
                      style={{ color: "var(--color-outline)", background: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-outline-variant)" }}>
                      Tiết {tiet}
                    </td>
                    {DAYS.map((d) => {
                      const slot = slots.find((s) => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                      if (slot) {
                        const c = getSubjectColor(slot.mon);
                        return (
                          <td key={d.thu} className="p-2 text-center">
                            <div className="rounded-xl px-2 py-2.5"
                              style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: c.text }}>{slot.mon}</p>
                              <p className="font-bold text-sm mt-0.5" style={{ color: c.text }}>
                                {mode === "gv" ? slot.lop : slot.ma_gv}
                              </p>
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={d.thu} className="p-2 text-center">
                          <div className="min-h-[52px]" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LichContent() {
  const searchParams = useSearchParams();
  const maGv = searchParams.get("gv") || "";
  const [tab, setTab] = useState<"ca-nhan" | "lop-cn">("ca-nhan");

  const gv = getGiaoVienByMa(maGv);
  const mySlots = getTKBByMaGv(maGv);
  const phanCong = getPhanCongByMaGv(maGv);

  // Lớp chủ nhiệm — tìm từ lopHocMock theo gvcn
  const lopCN = gv ? lopHocMock.find((l) => l.gvcn === gv.ma_gv) ?? null : null;
  const lopCNSlots = lopCN ? getTKBByLop(lopCN.ten_lop) : [];

  if (!gv) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "var(--color-surface)" }}>
        <div className="rounded-3xl p-8 text-center max-w-md w-full"
          style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 12px 32px rgba(30,58,138,0.07)" }}>
          <span className="material-symbols-outlined mb-3" style={{ fontSize: 48, color: "var(--color-error)" }}>person_off</span>
          <h2 className="text-xl font-headline font-bold mb-2" style={{ color: "var(--color-on-surface)" }}>
            Không tìm thấy giáo viên
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
            {maGv ? `Mã "${maGv}" không tồn tại trong hệ thống.` : "Chưa có mã giáo viên."}
          </p>
          <a href="/login-gv"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    );
  }

  const daysWithSlots = new Set(mySlots.map((s) => s.thu));

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 lg:px-8 py-3 flex items-center justify-between"
        style={{ background: "var(--color-surface-container-lowest)", borderBottom: "1px solid var(--color-outline-variant)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>school</span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-sm leading-tight" style={{ color: "var(--color-primary)" }}>TKB AI System</h1>
            <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: "var(--color-outline)" }}>Lịch dạy cá nhân</p>
          </div>
        </div>
        <a href="/login-gv"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
          style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_horiz</span>
          Đổi mã GV
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 space-y-5">
        {/* Teacher info card */}
        <div className="rounded-2xl p-5 lg:p-6"
          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))", color: "var(--color-on-primary)" }}>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              {gv.ho_ten.split(" ").pop()?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-headline font-bold">{gv.ho_ten}</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm opacity-85">
                <span>Mã: {gv.ma_gv}</span>
                <span>Tổ: {gv.to_chuyen_mon}</span>
                {gv.chuc_vu && <span>Chức vụ: {gv.chuc_vu}</span>}
                {lopCN && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>home</span>
                    CN: <strong>{lopCN.ten_lop}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{mySlots.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Tiết/tuần</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{daysWithSlots.size}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Ngày dạy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{phanCong.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Lớp dạy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab toggle — chỉ hiện nếu có lớp CN */}
        {lopCN && (
          <div className="flex gap-2 p-1 rounded-2xl w-fit"
            style={{ background: "var(--color-surface-container)" }}>
            <button onClick={() => setTab("ca-nhan")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === "ca-nhan" ? "var(--color-primary)" : "transparent",
                color: tab === "ca-nhan" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
              Lịch dạy của tôi
            </button>
            <button onClick={() => setTab("lop-cn")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === "lop-cn" ? "var(--color-primary)" : "transparent",
                color: tab === "lop-cn" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
              Lịch lớp {lopCN.ten_lop}
            </button>
          </div>
        )}

        {/* Tab: Lịch dạy cá nhân */}
        {tab === "ca-nhan" && (
          <>
            <div className="flex flex-wrap gap-2">
              {phanCong.map((pc) => {
                const c = getSubjectColor(pc.mon);
                return (
                  <span key={pc.id} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                    {pc.mon} {pc.lop} ({pc.so_tiet_tuan}t)
                  </span>
                );
              })}
            </div>
            <TKBGrid slots={mySlots} mode="gv" />
          </>
        )}

        {/* Tab: Lịch lớp chủ nhiệm */}
        {tab === "lop-cn" && lopCN && (
          <>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>home</span>
              <div>
                <p className="font-bold text-sm">Lớp chủ nhiệm {lopCN.ten_lop}</p>
                <p className="text-xs opacity-75">Khối {lopCN.khoi} · {lopCNSlots.length} tiết/tuần</p>
              </div>
            </div>
            {lopCNSlots.length > 0 ? (
              <TKBGrid slots={lopCNSlots} mode="lop" />
            ) : (
              <div className="rounded-2xl p-10 text-center"
                style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
                <span className="material-symbols-outlined mb-2" style={{ fontSize: 36 }}>event_busy</span>
                <p className="font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
                  Chưa có thời khoá biểu cho lớp {lopCN.ten_lop}
                </p>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs font-medium" style={{ color: "var(--color-outline)" }}>
            Năm học 2025–2026 · Học kỳ II · THCS Hòa Xuân
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LichPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface)" }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: "var(--color-primary)" }}>progress_activity</span>
      </div>
    }>
      <LichContent />
    </Suspense>
  );
}
