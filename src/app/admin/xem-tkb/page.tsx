"use client";

import { useState, Suspense } from "react";
import {
  giaoVienMock, lopHocMock,
  getGiaoVienByMa, getTKBByMaGv, getPhanCongByMaGv,
  getTKBByLop, getGVCNByLop,
} from "@/lib/mock-data";
import type { TKBSlot } from "@/lib/types";

// ─── Constants ───────────────────────────────────────────────────────────────
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
  "Thể Dục":   { bg: "#cffafe", text: "#164e63", border: "#67e8f9" },
  "Âm Nhạc":  { bg: "#fdf4ff", text: "#701a75", border: "#e879f9" },
  "Mỹ Thuật": { bg: "#fff7ed", text: "#9a3412", border: "#fb923c" },
  default:      { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};

function getSubjectColor(mon: string) {
  return SUBJECT_COLORS[mon] ?? SUBJECT_COLORS.default;
}

// ─── Get week dates starting from Monday ─────────────────────────────────────
function getWeekDates(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offsetWeeks * 7);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateFull(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ─── TKB Grid Component ───────────────────────────────────────────────────────
function TKBGrid({ slots, mode }: { slots: TKBSlot[]; mode: "gv" | "lop" }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getWeekDates(weekOffset);

  const mondayDate = weekDates[0];
  const sundayDate = weekDates[5];

  return (
    <div className="space-y-3">
      {/* Week navigator */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_left</span>
          </button>
          <div className="text-center px-3">
            <p className="text-xs font-bold" style={{ color: "var(--color-on-surface-variant)" }}>
              Tuần {weekOffset === 0 ? "này" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
              {formatDateFull(mondayDate)} — {formatDateFull(sundayDate)}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chevron_right</span>
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: "var(--color-tertiary-container)", color: "var(--color-on-tertiary-container)" }}
            >
              Tuần này
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-outline)" }}>
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#dbeafe" }} /> Sáng
          <span className="w-3 h-3 rounded-sm inline-block ml-2" style={{ background: "#f0fdf4" }} /> Chiều
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 680 }}>
            <thead>
              <tr style={{ background: "var(--color-primary)" }}>
                <th className="p-3 text-left text-xs font-bold uppercase tracking-wider w-[90px]"
                  style={{ color: "var(--color-on-primary)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>
                  Buổi / Tiết
                </th>
                {DAYS.map((d, i) => (
                  <th key={d.thu} className="p-3 text-center"
                    style={{ color: "var(--color-on-primary)", borderRight: i < 5 ? "1px solid rgba(255,255,255,0.2)" : undefined }}>
                    <p className="text-xs font-bold uppercase tracking-wider">{d.label}</p>
                    <p className="text-[11px] font-medium opacity-80 mt-0.5">{formatDate(weekDates[i])}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* SÁNG */}
              {PERIODS.map((tiet, idx) => (
                <tr key={`sang-${tiet}`}
                  style={{ borderTop: "1px solid var(--color-outline-variant)", background: idx % 2 === 0 ? "rgba(219,234,254,0.15)" : "transparent" }}>
                  <td className="p-2 text-center"
                    style={{ borderRight: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                    {idx === 0 && (
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--color-primary)" }}>Sáng</p>
                    )}
                    <span className="text-xs font-bold" style={{ color: "var(--color-on-surface-variant)" }}>Tiết {tiet}</span>
                  </td>
                  {DAYS.map((d, di) => {
                    const slot = slots.find((s) => s.thu === d.thu && s.buoi === "sang" && s.tiet === tiet);
                    return (
                      <td key={d.thu} className="p-1.5"
                        style={{ borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined }}>
                        {slot ? <SlotCell slot={slot} mode={mode} /> : <EmptyCell />}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Divider */}
              <tr>
                <td colSpan={7} style={{ background: "var(--color-outline-variant)", height: 3, padding: 0 }} />
              </tr>

              {/* CHIỀU */}
              {PERIODS.map((tiet, idx) => (
                <tr key={`chieu-${tiet}`}
                  style={{ borderTop: "1px solid var(--color-outline-variant)", background: idx % 2 === 0 ? "rgba(240,253,244,0.4)" : "transparent" }}>
                  <td className="p-2 text-center"
                    style={{ borderRight: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                    {idx === 0 && (
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "#16a34a" }}>Chiều</p>
                    )}
                    <span className="text-xs font-bold" style={{ color: "var(--color-on-surface-variant)" }}>Tiết {tiet}</span>
                  </td>
                  {DAYS.map((d, di) => {
                    const slot = slots.find((s) => s.thu === d.thu && s.buoi === "chieu" && s.tiet === tiet);
                    return (
                      <td key={d.thu} className="p-1.5"
                        style={{ borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined }}>
                        {slot ? <SlotCell slot={slot} mode={mode} /> : <EmptyCell />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SlotCell({ slot, mode }: { slot: TKBSlot; mode: "gv" | "lop" }) {
  const c = getSubjectColor(slot.mon);
  const displayName = mode === "gv"
    ? slot.lop
    : (giaoVienMock.find((g) => g.ma_gv === slot.ma_gv)?.ho_ten ?? slot.ma_gv);
  return (
    <div className="rounded-xl px-2 py-2 text-center transition-all hover:scale-[1.02]"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <p className="text-[10px] font-black uppercase tracking-wide leading-tight" style={{ color: c.text }}>{slot.mon}</p>
      <p className="font-bold text-sm mt-0.5 leading-tight" style={{ color: c.text }}>{displayName}</p>
    </div>
  );
}

function EmptyCell() {
  return <div className="min-h-[52px] rounded-xl" style={{ background: "rgba(0,0,0,0.02)" }} />;
}

// ─── GV Tab ───────────────────────────────────────────────────────────────────
function GVTab() {
  const [selectedGv, setSelectedGv] = useState("");
  const [searchText, setSearchText] = useState("");

  const gv = selectedGv ? getGiaoVienByMa(selectedGv) : null;
  const slots = selectedGv ? getTKBByMaGv(selectedGv) : [];
  const phanCong = selectedGv ? getPhanCongByMaGv(selectedGv) : [];

  const filteredGvList = giaoVienMock.filter(
    (g) => !searchText ||
      g.ma_gv.toLowerCase().includes(searchText.toLowerCase()) ||
      g.ho_ten.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Selector */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
              Tìm giáo viên
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "var(--color-surface-container-highest)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>search</span>
              <input className="bg-transparent border-none outline-none text-sm flex-1"
                style={{ color: "var(--color-on-surface)" }}
                placeholder="Nhập mã GV hoặc tên..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
              Chọn giáo viên
            </label>
            <select className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
              style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
              value={selectedGv}
              onChange={(e) => setSelectedGv(e.target.value)}>
              <option value="">-- Chọn giáo viên --</option>
              {filteredGvList.map((g) => (
                <option key={g.ma_gv} value={g.ma_gv}>{g.ma_gv} — {g.ho_ten} ({g.to_chuyen_mon})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {giaoVienMock.map((g) => (
            <button key={g.ma_gv} onClick={() => setSelectedGv(g.ma_gv)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{
                background: selectedGv === g.ma_gv ? "var(--color-primary)" : "var(--color-surface-container)",
                color: selectedGv === g.ma_gv ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}>
              {g.ma_gv}
            </button>
          ))}
        </div>
      </div>

      {gv ? (
        <>
          {/* GV info */}
          <div className="rounded-2xl p-5 flex flex-wrap items-center gap-5"
            style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
              {gv.ho_ten.split(" ").pop()?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>{gv.ho_ten}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                <span>Mã: <strong style={{ color: "var(--color-primary)" }}>{gv.ma_gv}</strong></span>
                <span>Tổ: {gv.to_chuyen_mon}</span>
                {gv.chuc_vu && <span>Chức vụ: {gv.chuc_vu}</span>}
                {gv.lop_chu_nhiem && <span>Lớp CN: <strong>{gv.lop_chu_nhiem}</strong></span>}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{slots.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Tiết/tuần</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{phanCong.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Lớp dạy</p>
              </div>
            </div>
          </div>

          {/* Phân công tags */}
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

          <TKBGrid slots={slots} mode="gv" />
        </>
      ) : (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
          <span className="material-symbols-outlined mb-3" style={{ fontSize: 40 }}>person_search</span>
          <p className="font-semibold text-lg" style={{ color: "var(--color-on-surface-variant)" }}>Chọn giáo viên để xem lịch dạy</p>
        </div>
      )}
    </div>
  );
}

// ─── Lớp Tab ─────────────────────────────────────────────────────────────────
function LopTab() {
  const [selectedLop, setSelectedLop] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedKhoi, setSelectedKhoi] = useState<number | "">("");

  const slots = selectedLop ? getTKBByLop(selectedLop) : [];
  const gvcn = selectedLop ? getGVCNByLop(selectedLop) : null;

  const filteredLops = lopHocMock.filter((l) => {
    const matchSearch = !searchText || l.ten_lop.toLowerCase().includes(searchText.toLowerCase());
    const matchKhoi = selectedKhoi === "" || l.khoi === selectedKhoi;
    return matchSearch && matchKhoi;
  });

  const khoiList = [6, 7, 8, 9];

  return (
    <div className="space-y-5">
      {/* Selector */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
              Tìm lớp
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: "var(--color-surface-container-highest)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>search</span>
              <input className="bg-transparent border-none outline-none text-sm flex-1"
                style={{ color: "var(--color-on-surface)" }}
                placeholder="vd: 9/3, 6/1..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)} />
            </div>
          </div>
          <div className="min-w-[130px]">
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
              Khối
            </label>
            <select className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
              style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
              value={selectedKhoi}
              onChange={(e) => setSelectedKhoi(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Tất cả</option>
              {khoiList.map((k) => <option key={k} value={k}>Khối {k}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
              Chọn lớp
            </label>
            <select className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
              style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
              value={selectedLop}
              onChange={(e) => setSelectedLop(e.target.value)}>
              <option value="">-- Chọn lớp --</option>
              {filteredLops.map((l) => <option key={l.ten_lop} value={l.ten_lop}>{l.ten_lop}</option>)}
            </select>
          </div>
        </div>

        {/* Quick select by khoi */}
        <div className="space-y-2">
          {khoiList.map((k) => {
            const lopsInKhoi = lopHocMock.filter((l) => l.khoi === k);
            return (
              <div key={k} className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider w-12 flex-shrink-0"
                  style={{ color: "var(--color-outline)" }}>K{k}</span>
                {lopsInKhoi.map((l) => (
                  <button key={l.ten_lop} onClick={() => setSelectedLop(l.ten_lop)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                    style={{
                      background: selectedLop === l.ten_lop ? "var(--color-primary)" : "var(--color-surface-container)",
                      color: selectedLop === l.ten_lop ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                    }}>
                    {l.ten_lop}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {selectedLop ? (
        <>
          {/* Lớp info */}
          <div className="rounded-2xl p-5 flex flex-wrap items-center gap-5"
            style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
              {selectedLop}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
                Lớp {selectedLop}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                <span>Khối: <strong>{lopHocMock.find((l) => l.ten_lop === selectedLop)?.khoi}</strong></span>
                {gvcn ? (
                  <span>GVCN: <strong style={{ color: "var(--color-primary)" }}>{gvcn.ho_ten}</strong></span>
                ) : (
                  <span className="italic">Chưa có GVCN</span>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{slots.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Tiết/tuần</p>
            </div>
          </div>

          <TKBGrid slots={slots} mode="lop" />
        </>
      ) : (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
          <span className="material-symbols-outlined mb-3" style={{ fontSize: 40 }}>class</span>
          <p className="font-semibold text-lg" style={{ color: "var(--color-on-surface-variant)" }}>Chọn lớp để xem thời khoá biểu</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function XemTKBContent() {
  const [activeTab, setActiveTab] = useState<"gv" | "lop">("gv");

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
          Xem thời khoá biểu
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Tra cứu lịch dạy theo giáo viên hoặc theo lớp
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 p-1 rounded-2xl w-fit"
        style={{ background: "var(--color-surface-container)" }}>
        <button
          onClick={() => setActiveTab("gv")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: activeTab === "gv" ? "var(--color-primary)" : "transparent",
            color: activeTab === "gv" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
          Theo giáo viên
        </button>
        <button
          onClick={() => setActiveTab("lop")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: activeTab === "lop" ? "var(--color-primary)" : "transparent",
            color: activeTab === "lop" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>class</span>
          Theo lớp
        </button>
      </div>

      {activeTab === "gv" ? <GVTab /> : <LopTab />}
    </div>
  );
}

export default function XemTKBPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--color-primary)" }}>progress_activity</span>
      </div>
    }>
      <XemTKBContent />
    </Suspense>
  );
}
