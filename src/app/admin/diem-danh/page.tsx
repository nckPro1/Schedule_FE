"use client";

import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { getAllRecords, processGiaiTrinh, resetStore } from "@/lib/attendance-store";
import { MOCK_GIAO_VIEN, MOCK_TKB } from "@/lib/mock-data";
import { THU_LABELS, getPeriodTime } from "@/lib/time-utils";
import type { DiemDanhRecord, TrangThaiDiemDanh } from "@/lib/types";

// ─── Cấu hình trạng thái ──────────────────────────────────────────────────────

const STATUS_CFG: Record<TrangThaiDiemDanh, { label: string; bg: string; text: string; icon: string }> = {
  dung_gio:       { label: "Đúng giờ", bg: "#dcfce7", text: "#166534", icon: "check_circle" },
  muon:           { label: "Muộn",     bg: "#fef3c7", text: "#92400e", icon: "schedule" },
  tre:            { label: "Trễ",      bg: "#ffedd5", text: "#7c2d12", icon: "warning" },
  vang_mat:       { label: "Vắng",     bg: "#fee2e2", text: "#991b1b", icon: "cancel" },
  chua_diem_danh: { label: "Chưa ĐD", bg: "#f3f4f6", text: "#6b7280", icon: "radio_button_unchecked" },
};

const DAYS = [
  { thu: 2, label: "T2" },
  { thu: 3, label: "T3" },
  { thu: 4, label: "T4" },
  { thu: 5, label: "T5" },
  { thu: 6, label: "T6" },
  { thu: 7, label: "T7" },
];
const PERIODS = [1, 2, 3, 4, 5];

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
          {Array.from({ length: 9 }).map((_, j) => (
            <td key={j} className="px-3 py-3">
              <div
                className="h-4 rounded animate-pulse"
                style={{
                  background: "var(--color-surface-container)",
                  width: j === 0 ? "80%" : j === 2 ? "90%" : "60%",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Modal xem ảnh ────────────────────────────────────────────────────────────

function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}>
      <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Ảnh điểm danh" className="w-full rounded-2xl" />
        <button onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>
    </div>
  );
}

// ─── Modal TKB của giáo viên ──────────────────────────────────────────────────

function GvTkbModal({ maGv, hoTen, onClose }: { maGv: string; hoTen: string; onClose: () => void }) {
  const slots = MOCK_TKB.filter((s) => s.ma_gv === maGv);

  const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
    "Toán":       { bg: "#dbeafe", text: "#1e3a8a" },
    "Ngữ Văn":   { bg: "#fce7f3", text: "#831843" },
    "Tiếng Anh": { bg: "#d1fae5", text: "#064e3b" },
    "KHTN":       { bg: "#ffedd5", text: "#7c2d12" },
    "Lịch Sử":  { bg: "#fef9c3", text: "#713f12" },
    "Địa Lý":   { bg: "#ecfccb", text: "#365314" },
    "GDCD":       { bg: "#ede9fe", text: "#4c1d95" },
    "Thể dục":  { bg: "#e0f2fe", text: "#075985" },
    default:      { bg: "#f3f4f6", text: "#374151" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <div>
            <p className="font-bold">{hoTen}</p>
            <p className="text-xs opacity-80">Thời khóa biểu cá nhân · {maGv}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        {/* TKB Grid */}
        <div className="overflow-x-auto p-4">
          <table className="w-full text-xs" style={{ minWidth: 500 }}>
            <thead>
              <tr style={{ background: "var(--color-surface-container-low)" }}>
                <th className="py-2 px-3 text-left font-bold" style={{ color: "var(--color-outline)" }}>Tiết</th>
                {DAYS.map((d) => (
                  <th key={d.thu} className="py-2 px-2 text-center font-bold" style={{ color: "var(--color-on-surface)" }}>
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["sang", "chieu"] as const).map((buoi) => (
                <>
                  <tr key={buoi}>
                    <td colSpan={7} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{
                        background: buoi === "sang" ? "#eff6ff" : "#f0fdf4",
                        color: buoi === "sang" ? "#1d4ed8" : "#15803d",
                      }}>
                      {buoi === "sang" ? "☀ Sáng" : "🌤 Chiều"}
                    </td>
                  </tr>
                  {PERIODS.map((tiet) => {
                    const pt = getPeriodTime(buoi, tiet);
                    return (
                      <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                        <td className="py-1.5 px-3 text-center font-mono"
                          style={{ color: "var(--color-outline)", background: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-outline-variant)" }}>
                          <p className="font-bold">{tiet}</p>
                          <p className="text-[9px]">{pt.start}</p>
                        </td>
                        {DAYS.map((d) => {
                          const slot = slots.find((s) => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                          if (!slot) return (
                            <td key={d.thu} className="py-1.5 px-1"
                              style={{ borderRight: "1px solid var(--color-outline-variant)" }}>
                              <div className="h-10 rounded"
                                style={{ background: "var(--color-surface-container-low)", opacity: 0.4 }} />
                            </td>
                          );
                          const c = SUBJECT_COLORS[slot.mon] ?? SUBJECT_COLORS.default;
                          return (
                            <td key={d.thu} className="py-1.5 px-1"
                              style={{ borderRight: "1px solid var(--color-outline-variant)" }}>
                              <div className="h-10 rounded px-1.5 py-1 flex flex-col justify-center"
                                style={{ background: c.bg }}>
                                <p className="font-bold leading-tight truncate" style={{ color: c.text, fontSize: 9 }}>{slot.mon}</p>
                                <p className="leading-tight" style={{ color: c.text, fontSize: 9 }}>{slot.lop}</p>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Modal xử lý giải trình (Admin) ──────────────────────────────────────────

function GiaiTrinhModal({ record, onClose, onProcess }: {
  record: DiemDanhRecord;
  onClose: () => void;
  onProcess: (xu_ly: "chap_nhan" | "tu_choi", phan_hoi: string) => void;
}) {
  const [phanHoi, setPhanHoi] = useState(record.admin_phan_hoi ?? "");
  const cfg = STATUS_CFG[record.trang_thai];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: "var(--color-surface-container-low)", borderBottom: "1px solid var(--color-outline-variant)" }}>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Xử lý giải trình</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-outline)" }}>
              {record.ho_ten_gv} · T{record.tiet} {record.lop} · {record.ngay}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: cfg.bg, color: cfg.text }}>
            <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{cfg.icon}</span>
            {cfg.label}{record.tre_phut ? ` +${record.tre_phut}p` : ""}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Lý do của giáo viên */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>
              Lý do từ giáo viên
            </p>
            {record.ghi_chu ? (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0c4a6e" }}>
                {record.ghi_chu}
              </div>
            ) : (
              <div className="rounded-xl px-4 py-3 text-sm italic" style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
                Giáo viên chưa cung cấp lý do.
              </div>
            )}
          </div>

          {/* Phản hồi của admin */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>
              Phản hồi của ban giám hiệu (tuỳ chọn)
            </p>
            <textarea
              value={phanHoi}
              onChange={(e) => setPhanHoi(e.target.value)}
              rows={2}
              placeholder="Ghi chú thêm nếu cần..."
              className="w-full rounded-xl px-3 py-2 text-sm resize-none"
              style={{
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
                border: "1px solid var(--color-outline-variant)",
              }}
            />
          </div>

          {/* Kết quả xử lý trước đó */}
          {record.xu_ly_giai_trinh && (
            <div className="rounded-xl px-3 py-2 text-xs font-semibold"
              style={record.xu_ly_giai_trinh === "chap_nhan"
                ? { background: "#dcfce7", color: "#166534" }
                : { background: "#fee2e2", color: "#991b1b" }}>
              Đã xử lý: {record.xu_ly_giai_trinh === "chap_nhan" ? "Chấp nhận" : "Từ chối"}
              {record.admin_phan_hoi ? ` — ${record.admin_phan_hoi}` : ""}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}>
            Huỷ
          </button>
          <button onClick={() => onProcess("tu_choi", phanHoi)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#fee2e2", color: "#991b1b" }}>
            Từ chối
          </button>
          <button onClick={() => onProcess("chap_nhan", phanHoi)}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "#16a34a" }}>
            Chấp nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trang chính ───────────────────────────────────────────────────────────────

type FilterStatus = "all" | "cho_xu_ly" | TrangThaiDiemDanh;

export default function AdminDiemDanhPage() {
  const [records, setRecords]             = useState<DiemDanhRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filterGv, setFilterGv]           = useState("all");
  const [filterStatus, setFilterStatus]   = useState<FilterStatus>("all");
  const [filterBuoi, setFilterBuoi]       = useState("all");
  const [filterDate, setFilterDate]       = useState("");
  const [viewImg, setViewImg]             = useState<string | null>(null);
  const [giaiTrinhRec, setGiaiTrinhRec]   = useState<DiemDanhRecord | null>(null);
  const [tkbGv, setTkbGv]                 = useState<{ maGv: string; hoTen: string } | null>(null);
  const [sortDesc, setSortDesc]           = useState(true);

  function load() {
    setLoading(true);
    // Simulate async load for skeleton demo
    setTimeout(() => {
      setRecords(getAllRecords());
      setLoading(false);
    }, 500);
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    return records
      .filter((r) => {
        if (filterGv !== "all" && r.ma_gv !== filterGv) return false;
        if (filterStatus === "cho_xu_ly") {
          if (!r.da_giai_trinh || r.xu_ly_giai_trinh) return false;
        } else if (filterStatus !== "all" && r.trang_thai !== filterStatus) return false;
        if (filterBuoi !== "all" && r.buoi !== filterBuoi) return false;
        if (filterDate && r.ngay !== filterDate) return false;
        return true;
      })
      .sort((a, b) => {
        const cmp = (a.ngay + a.buoi + a.tiet).localeCompare(b.ngay + b.buoi + b.tiet);
        return sortDesc ? -cmp : cmp;
      });
  }, [records, filterGv, filterStatus, filterBuoi, filterDate, sortDesc]);

  // Thống kê
  const stats = useMemo(() => ({
    total:     records.length,
    dung_gio:  records.filter((r) => r.trang_thai === "dung_gio").length,
    muon:      records.filter((r) => r.trang_thai === "muon").length,
    tre:       records.filter((r) => r.trang_thai === "tre").length,
    vang_mat:  records.filter((r) => r.trang_thai === "vang_mat").length,
    cho_xu_ly: records.filter((r) => r.da_giai_trinh && !r.xu_ly_giai_trinh).length,
  }), [records]);

  function handleProcessGiaiTrinh(xu_ly: "chap_nhan" | "tu_choi", phan_hoi: string) {
    if (!giaiTrinhRec) return;
    processGiaiTrinh(giaiTrinhRec.id, xu_ly, phan_hoi || undefined);
    setGiaiTrinhRec(null);
    load();
  }

  function handleReset() {
    if (!confirm("Xoá toàn bộ dữ liệu điểm danh và khôi phục seed data?")) return;
    resetStore();
    load();
  }

  function exportExcel() {
    const data = filtered.map((r) => ({
      "Giáo viên":        r.ho_ten_gv,
      "Mã GV":            r.ma_gv,
      "Ngày":             r.ngay,
      "Thứ":              THU_LABELS[r.thu] ?? "",
      "Tiết":             r.tiet,
      "Buổi":             r.buoi === "sang" ? "Sáng" : "Chiều",
      "Lớp":              r.lop,
      "Môn":              r.mon,
      "Giờ bắt đầu":     r.gio_bat_dau,
      "Giờ kết thúc":    r.gio_ket_thuc,
      "Giờ vào":         r.thoi_gian_vao
        ? new Date(r.thoi_gian_vao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        : "",
      "Giờ ra":          r.thoi_gian_ra
        ? new Date(r.thoi_gian_ra).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        : "",
      "Trễ (phút)":      r.tre_phut ?? 0,
      "Trạng thái":      STATUS_CFG[r.trang_thai].label,
      "Đã điểm danh ra": r.da_diem_danh_ra ? "Có" : "Không",
      "Đã giải trình":   r.da_giai_trinh ? "Có" : "Không",
      "Ghi chú":         r.ghi_chu ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    // Cột rộng hơn cho dễ đọc
    ws["!cols"] = [
      { wch: 20 }, { wch: 8 }, { wch: 12 }, { wch: 10 }, { wch: 6 },
      { wch: 8 }, { wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
      { wch: 14 }, { wch: 30 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Điểm danh");
    XLSX.writeFile(wb, `diem_danh_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            Quản lý điểm danh
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Theo dõi điểm danh vào/ra của giáo viên theo từng tiết học
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel}
            disabled={loading || filtered.length === 0}
            className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: "#dcfce7", color: "#166534" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
            Xuất Excel ({filtered.length})
          </button>
          <button onClick={handleReset}
            className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80"
            style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
            Reset demo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "Tổng cộng",   value: stats.total,     bg: "var(--color-surface-container-lowest)", text: "var(--color-on-surface)", filter: "all" as FilterStatus },
          { label: "Đúng giờ",   value: stats.dung_gio,  bg: "#dcfce7",  text: "#166534", filter: "dung_gio" as FilterStatus },
          { label: "Muộn",       value: stats.muon,      bg: "#fef3c7",  text: "#92400e", filter: "muon" as FilterStatus },
          { label: "Trễ",        value: stats.tre,       bg: "#ffedd5",  text: "#7c2d12", filter: "tre" as FilterStatus },
          { label: "Vắng mặt",   value: stats.vang_mat,  bg: "#fee2e2",  text: "#991b1b", filter: "vang_mat" as FilterStatus },
          { label: "Chờ xử lý",  value: stats.cho_xu_ly, bg: "#fef3c7",  text: "#854d0e", filter: "cho_xu_ly" as FilterStatus },
        ].map((s) => (
          <button key={s.label}
            onClick={() => setFilterStatus(filterStatus === s.filter ? "all" : s.filter)}
            className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02]"
            style={{
              background: s.bg,
              boxShadow: filterStatus === s.filter ? `0 0 0 2px ${s.text}` : "0 2px 8px rgba(0,0,0,0.04)",
            }}>
            {loading ? (
              <div className="h-8 w-12 rounded animate-pulse" style={{ background: "var(--color-surface-container)" }} />
            ) : (
              <p className="text-3xl font-headline font-black" style={{ color: s.text }}>{s.value}</p>
            )}
            <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: s.text, opacity: 0.7 }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* AI Insights */}
      <div className="rounded-2xl p-4 space-y-2" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", border: "1px solid #4338ca" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#a5b4fc" }}>auto_awesome</span>
          <p className="text-xs font-bold" style={{ color: "#c7d2fe" }}>AI Phân tích điểm danh</p>
          <span className="ml-auto text-[10px]" style={{ color: "#818cf8" }}>Cập nhật liên tục</span>
        </div>
        {[
          { icon: "trending_down", color: "#f87171", text: "Tỷ lệ đi muộn tăng 15% so với tuần trước — đặc biệt vào buổi sáng thứ 2." },
          { icon: "person_alert",  color: "#fbbf24", text: "GV Nguyễn Văn An và GV Trần Thị Bình có xu hướng đến muộn vào thứ 2 trong 3 tuần liên tiếp." },
          { icon: "schedule",      color: "#f87171", text: "3 giáo viên chưa điểm danh ra tiết chiều hôm nay. Vui lòng xác nhận." },
          { icon: "insights",      color: "#34d399", text: "Trung bình toàn trường: 91% đúng giờ — cao nhất trong tháng." },
        ].map((ins, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.06)" }}>
            <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: 14, color: ins.color }}>{ins.icon}</span>
            <p className="text-[11px] leading-relaxed" style={{ color: "#e0e7ff" }}>{ins.text}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-outline)" }}>Giáo viên</label>
          <select value={filterGv} onChange={(e) => setFilterGv(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)" }}>
            <option value="all">Tất cả</option>
            {MOCK_GIAO_VIEN.map((g) => (
              <option key={g.ma_gv} value={g.ma_gv}>{g.ho_ten}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-outline)" }}>Trạng thái</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)" }}>
            <option value="all">Tất cả</option>
            <option value="cho_xu_ly">Chờ xử lý</option>
            {(Object.keys(STATUS_CFG) as TrangThaiDiemDanh[]).map((k) => (
              <option key={k} value={k}>{STATUS_CFG[k].label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-outline)" }}>Buổi</label>
          <select value={filterBuoi} onChange={(e) => setFilterBuoi(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)" }}>
            <option value="all">Tất cả</option>
            <option value="sang">Sáng</option>
            <option value="chieu">Chiều</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-outline)" }}>Ngày</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: "var(--color-surface-container-lowest)", color: "var(--color-on-surface)", border: "1px solid var(--color-outline-variant)" }}
          />
        </div>

        {filterDate && (
          <button onClick={() => setFilterDate("")}
            className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
            style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
            Xoá ngày
          </button>
        )}

        <div className="ml-auto">
          <p className="text-xs" style={{ color: "var(--color-outline)" }}>
            {loading ? "Đang tải..." : `${filtered.length} bản ghi`}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: 780 }}>
            <thead>
              <tr style={{ background: "var(--color-surface-container-low)" }}>
                {[
                  { label: "Giáo viên",   sortable: false },
                  { label: "Ngày",        sortable: true  },
                  { label: "Tiết / Lớp",  sortable: false },
                  { label: "Giờ vào",    sortable: false },
                  { label: "Giờ ra",     sortable: false },
                  { label: "Trễ (phút)", sortable: false },
                  { label: "Trạng thái", sortable: false },
                  { label: "Ảnh",         sortable: false },
                  { label: "Giải trình",  sortable: false },
                ].map((h) => (
                  <th key={h.label}
                    className={`px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider ${h.sortable ? "cursor-pointer select-none hover:opacity-70" : ""}`}
                    style={{ color: "var(--color-outline)" }}
                    onClick={h.sortable ? () => setSortDesc(!sortDesc) : undefined}>
                    {h.label}
                    {h.sortable && <span className="ml-1">{sortDesc ? "↓" : "↑"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-sm" style={{ color: "var(--color-outline)" }}>
                    Không có dữ liệu điểm danh phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const cfg = STATUS_CFG[rec.trang_thai];
                  const fmtTime = (iso?: string) =>
                    iso ? new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

                  return (
                    <tr key={rec.id} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                      {/* Giáo viên — click để xem TKB */}
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setTkbGv({ maGv: rec.ma_gv, hoTen: rec.ho_ten_gv })}
                          className="text-left hover:underline"
                          title="Xem TKB giáo viên"
                        >
                          <p className="font-semibold text-xs" style={{ color: "var(--color-primary)" }}>{rec.ho_ten_gv}</p>
                          <p className="font-mono text-[10px]" style={{ color: "var(--color-outline)" }}>{rec.ma_gv}</p>
                        </button>
                      </td>

                      {/* Ngày */}
                      <td className="px-3 py-2.5">
                        <p className="font-mono text-xs">{rec.ngay}</p>
                        <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>{THU_LABELS[rec.thu]}</p>
                      </td>

                      {/* Tiết / Lớp */}
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-xs">
                          T{rec.tiet} {rec.buoi === "sang" ? "☀" : "🌤"} · {rec.lop}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>{rec.mon} · {rec.gio_bat_dau}–{rec.gio_ket_thuc}</p>
                      </td>

                      {/* Giờ vào */}
                      <td className="px-3 py-2.5 font-mono text-xs">{fmtTime(rec.thoi_gian_vao)}</td>

                      {/* Giờ ra */}
                      <td className="px-3 py-2.5">
                        {rec.da_diem_danh_ra ? (
                          <span className="font-mono text-xs">{fmtTime(rec.thoi_gian_ra)}</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>Chưa ra</span>
                        )}
                      </td>

                      {/* Trễ */}
                      <td className="px-3 py-2.5 text-center text-xs font-mono">
                        {rec.tre_phut != null && rec.tre_phut > 0 ? (
                          <span className="font-bold" style={{ color: rec.tre_phut >= 10 ? "#991b1b" : "#92400e" }}>
                            +{rec.tre_phut}
                          </span>
                        ) : "—"}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: cfg.bg, color: cfg.text }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Ảnh */}
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1.5">
                          {rec.anh_vao ? (
                            <button onClick={() => setViewImg(rec.anh_vao!)}
                              className="w-8 h-8 rounded-lg overflow-hidden border-2 hover:scale-110 transition-all"
                              style={{ borderColor: "#93c5fd" }}
                              title="Ảnh khuôn mặt (vào)">
                              <img src={rec.anh_vao} alt="mặt vào" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "var(--color-surface-container)", border: "1px dashed var(--color-outline-variant)" }}
                              title="Chưa có ảnh khuôn mặt">
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--color-outline)" }}>face</span>
                            </div>
                          )}
                          {rec.anh_ra ? (
                            <button onClick={() => setViewImg(rec.anh_ra!)}
                              className="w-8 h-8 rounded-lg overflow-hidden border-2 hover:scale-110 transition-all"
                              style={{ borderColor: rec.da_diem_danh_ra ? "#86efac" : "#fcd34d" }}
                              title={rec.da_diem_danh_ra ? "Ảnh lớp học (ra tiết)" : "Ảnh lớp học (vào tiết)"}>
                              <img src={rec.anh_ra} alt="lớp" className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "var(--color-surface-container)", border: "1px dashed var(--color-outline-variant)" }}
                              title="Chưa có ảnh lớp">
                              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--color-outline)" }}>groups</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Giải trình */}
                      <td className="px-3 py-2.5">
                        {["vang_mat", "muon", "tre"].includes(rec.trang_thai) ? (
                          !rec.da_giai_trinh ? (
                            <span className="text-[10px]" style={{ color: "var(--color-outline)" }}>Chưa giải trình</span>
                          ) : rec.xu_ly_giai_trinh === "chap_nhan" ? (
                            <button onClick={() => setGiaiTrinhRec(rec)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all hover:scale-105"
                              style={{ background: "#dcfce7", color: "#166534" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>check_circle</span>
                              Đã chấp nhận
                            </button>
                          ) : rec.xu_ly_giai_trinh === "tu_choi" ? (
                            <button onClick={() => setGiaiTrinhRec(rec)}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all hover:scale-105"
                              style={{ background: "#fee2e2", color: "#991b1b" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>cancel</span>
                              Đã từ chối
                            </button>
                          ) : (
                            <button onClick={() => setGiaiTrinhRec(rec)}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all hover:scale-105 animate-pulse"
                              style={{ background: "#fef3c7", color: "#854d0e" }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 11 }}>hourglass_empty</span>
                              Chờ xử lý
                            </button>
                          )
                        ) : (
                          <span className="text-[10px]" style={{ color: "var(--color-outline)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chú thích */}
      <div className="rounded-xl p-4 text-xs space-y-1" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
        <p className="font-semibold" style={{ color: "var(--color-on-surface)" }}>Quy tắc điểm danh:</p>
        <p>• <strong>Đúng giờ</strong>: Điểm danh trong vòng 5 phút từ khi tiết bắt đầu</p>
        <p>• <strong>Muộn</strong>: Điểm danh từ 5–10 phút sau giờ bắt đầu</p>
        <p>• <strong>Trễ</strong>: Điểm danh từ 10–15 phút sau giờ bắt đầu</p>
        <p>• <strong>Vắng mặt</strong>: Quá 15 phút hoặc không điểm danh — giáo viên phải giải trình</p>
        <p>• Cửa sổ điểm danh mở từ <strong>5 phút trước</strong> khi tiết bắt đầu</p>
        <p className="pt-1" style={{ color: "var(--color-outline)" }}>
          Tip: Click tên giáo viên để xem TKB của họ. Click "Xuất Excel" để tải file báo cáo.
        </p>
      </div>

      {/* Modals */}
      {viewImg && <ImageModal src={viewImg} onClose={() => setViewImg(null)} />}
      {giaiTrinhRec && (
        <GiaiTrinhModal
          record={giaiTrinhRec}
          onClose={() => setGiaiTrinhRec(null)}
          onProcess={handleProcessGiaiTrinh}
        />
      )}
      {tkbGv && (
        <GvTkbModal
          maGv={tkbGv.maGv}
          hoTen={tkbGv.hoTen}
          onClose={() => setTkbGv(null)}
        />
      )}
    </div>
  );
}
