"use client";
import { useEffect, useState } from "react";
import { getTKBSummary } from "@/lib/api";
import { getAllRecords } from "@/lib/attendance-store";
import { MOCK_TKB, MOCK_GIAO_VIEN } from "@/lib/mock-data";

// ─── Donut Chart ──────────────────────────────────────────────────────────────

const DD_SEGMENTS = [
  { key: "dung_gio", label: "Đúng giờ", color: "#16a34a", light: "#dcfce7" },
  { key: "muon",     label: "Muộn",     color: "#d97706", light: "#fef3c7" },
  { key: "tre",      label: "Trễ",      color: "#ea580c", light: "#ffedd5" },
  { key: "vang_mat", label: "Vắng",     color: "#dc2626", light: "#fee2e2" },
] as const;

function DonutChart({ stats }: {
  stats: { dung_gio: number; muon: number; tre: number; vang_mat: number };
}) {
  const total = DD_SEGMENTS.reduce((s, seg) => s + stats[seg.key], 0);

  // Build conic-gradient stops
  let prev = 0;
  const gradient = total === 0
    ? "#e5e7eb"
    : DD_SEGMENTS.map((seg) => {
        const pct = (stats[seg.key] / total) * 100;
        const stop = `${seg.color} ${prev.toFixed(2)}% ${(prev + pct).toFixed(2)}%`;
        prev += pct;
        return stop;
      }).join(", ");

  return (
    <div className="flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <div
          className="w-full h-full rounded-full"
          style={{ background: total === 0 ? "#e5e7eb" : `conic-gradient(${gradient})` }}
        />
        {/* Inner cutout */}
        <div
          className="absolute rounded-full flex flex-col items-center justify-center"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 82, height: 82,
            background: "var(--color-surface-container-lowest)",
          }}
        >
          <span className="font-black text-xl leading-none" style={{ color: "var(--color-primary)" }}>
            {total}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "var(--color-outline)" }}>
            tiết
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 flex-1">
        {DD_SEGMENTS.map((seg) => {
          const count = stats[seg.key];
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={seg.key} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-xs flex-1" style={{ color: "var(--color-on-surface-variant)" }}>
                {seg.label}
              </span>
              <span className="text-xs font-bold tabular-nums" style={{ color: seg.color }}>
                {count}
              </span>
              <span className="text-[10px] w-8 text-right" style={{ color: "var(--color-outline)" }}>
                {pct}%
              </span>
            </div>
          );
        })}
        {total === 0 && (
          <p className="text-xs" style={{ color: "var(--color-outline)" }}>Chưa có dữ liệu</p>
        )}
      </div>
    </div>
  );
}

// ─── GV Workload Bar Chart ────────────────────────────────────────────────────

const OVERLOAD_THRESHOLD = 20;

function GvWorkloadChart() {
  const all = MOCK_GIAO_VIEN
    .filter((g) => g.active)
    .map((gv) => ({
      name: gv.ho_ten.split(" ").slice(-1)[0],
      fullName: gv.ho_ten,
      ma_gv: gv.ma_gv,
      count: MOCK_TKB.filter((s) => s.ma_gv === gv.ma_gv).length,
    }))
    .sort((a, b) => b.count - a.count);

  const [showAll, setShowAll] = useState(false);
  const data = showAll ? all : all.slice(0, 8);
  const max = Math.max(...all.map((d) => d.count), OVERLOAD_THRESHOLD + 4, 1);
  const thresholdPct = (OVERLOAD_THRESHOLD / max) * 100;

  function barColor(count: number) {
    if (count > OVERLOAD_THRESHOLD) return { bar: "#ef4444", bg: "#fee2e2", text: "#991b1b" };
    if (count >= 18)               return { bar: "#f59e0b", bg: "#fef3c7", text: "#92400e" };
    return                                { bar: "#3b82f6", bg: "#dbeafe", text: "#1e3a8a" };
  }

  return (
    <div className="space-y-1">
      {/* Legend */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {[
          { color: "#3b82f6", label: "Bình thường (≤17)" },
          { color: "#f59e0b", label: "Gần giới hạn (18–20)" },
          { color: "#ef4444", label: "Quá tải (>20)" },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-on-surface-variant)" }}>
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Bars */}
      <div className="relative">
        {/* Threshold marker */}
        <div className="absolute top-0 bottom-0 pointer-events-none z-10"
          style={{ left: `calc(${thresholdPct}% + 76px)`, width: 1, background: "#fca5a5", borderLeft: "1.5px dashed #ef4444" }}>
          <span className="absolute -top-4 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap px-1 rounded"
            style={{ background: "#fee2e2", color: "#991b1b" }}>
            ngưỡng {OVERLOAD_THRESHOLD}
          </span>
        </div>

        <div className="space-y-2 pt-4">
          {data.map((d) => {
            const c = barColor(d.count);
            const widthPct = Math.max((d.count / max) * 100, d.count > 0 ? 5 : 0);
            return (
              <div key={d.ma_gv} className="flex items-center gap-2" title={d.fullName}>
                <span className="text-xs font-medium text-right shrink-0 truncate"
                  style={{ width: 68, color: "var(--color-on-surface-variant)", fontSize: 11 }}>
                  {d.fullName.split(" ").slice(-2).join(" ")}
                </span>
                <div className="flex-1 rounded-full overflow-hidden relative"
                  style={{ height: 20, background: "var(--color-surface-container)" }}>
                  <div className="h-full rounded-full flex items-center transition-all duration-500"
                    style={{ width: `${widthPct}%`, background: c.bar, minWidth: d.count > 0 ? 28 : 0 }}>
                    {d.count > 0 && (
                      <span className="ml-auto mr-2 text-[10px] font-black text-white leading-none tabular-nums">
                        {d.count}
                      </span>
                    )}
                  </div>
                </div>
                {d.count > OVERLOAD_THRESHOLD && (
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: 14, color: "#ef4444" }}>warning</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>
          Số tiết/tuần · {all.filter(d => d.count > OVERLOAD_THRESHOLD).length} GV quá tải
        </p>
        {all.length > 8 && (
          <button onClick={() => setShowAll(v => !v)}
            className="text-[10px] font-semibold"
            style={{ color: "var(--color-primary)" }}>
            {showAll ? "Thu gọn" : `+ ${all.length - 8} GV khác`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stats, setStats] = useState({
    so_gv: 0,
    so_lop: 0,
    so_rang_buoc_hard: 0,
    so_rang_buoc_soft: 0,
    so_phan_cong: 0,
  });

  const [ddStats, setDdStats] = useState({
    tong: 0,
    dung_gio: 0,
    muon: 0,
    tre: 0,
    vang_mat: 0,
    chua_giai_trinh: 0,
  });

  useEffect(() => {
    getTKBSummary().then(setStats).catch(() => null);
  }, []);

  useEffect(() => {
    const records = getAllRecords();
    const tong = records.filter((r) => r.trang_thai !== "chua_diem_danh").length;
    setDdStats({
      tong,
      dung_gio:        records.filter((r) => r.trang_thai === "dung_gio").length,
      muon:            records.filter((r) => r.trang_thai === "muon").length,
      tre:             records.filter((r) => r.trang_thai === "tre").length,
      vang_mat:        records.filter((r) => r.trang_thai === "vang_mat").length,
      chua_giai_trinh: records.filter((r) => r.trang_thai === "vang_mat" && !r.da_giai_trinh).length,
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Tổng quan hệ thống thời khóa biểu
        </p>
      </div>

      {/* TKB Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Giáo viên",  value: stats.so_gv,                                         icon: "group",      color: "var(--color-primary)"   },
          { label: "Lớp học",    value: stats.so_lop,                                         icon: "school",     color: "var(--color-tertiary)"  },
          { label: "Ràng buộc",  value: stats.so_rang_buoc_hard + stats.so_rang_buoc_soft,    icon: "rule",       color: "var(--color-secondary)" },
          { label: "Phân công",  value: stats.so_phan_cong,                                   icon: "assignment", color: "var(--color-primary)"   },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>
                {s.label}
              </span>
            </div>
            <p className="text-3xl font-headline font-extrabold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Donut — Điểm danh */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>donut_large</span>
              <h2 className="font-headline font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>
                Phân bố điểm danh
              </h2>
            </div>
            <a
              href="/admin/diem-danh"
              className="text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            >
              Chi tiết
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
            </a>
          </div>
          <DonutChart stats={ddStats} />
          {ddStats.chua_giai_trinh > 0 && (
            <div
              className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
              style={{ background: "#fdf4ff", border: "1px solid #e879f9", color: "#701a75" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment_late</span>
              <span>
                <strong>{ddStats.chua_giai_trinh}</strong> vắng chưa giải trình —{" "}
                <a href="/admin/diem-danh" className="underline font-semibold">xử lý ngay</a>
              </span>
            </div>
          )}
        </div>

        {/* Bar — Tải trọng GV */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>bar_chart</span>
            <h2 className="font-headline font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>
              Tải trọng giáo viên
            </h2>
          </div>
          <GvWorkloadChart />
        </div>

      </div>

      {/* AI Insights */}
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>auto_awesome</span>
          </div>
          <h2 className="font-headline font-bold text-sm text-white">AI Insights</h2>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: "#a5b4fc" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Cập nhật lúc 07:30
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: "warning", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", text: "GV Phạm Thu Dung đang dạy 24 tiết/tuần — vượt ngưỡng khuyến nghị (20 tiết)." },
            { icon: "trending_up", color: "#34d399", bg: "rgba(52,211,153,0.12)", text: "Tỷ lệ điểm danh đúng giờ tuần này đạt 87% — tăng 5% so với tuần trước." },
            { icon: "schedule", color: "#f87171", bg: "rgba(248,113,113,0.12)", text: "3 giáo viên chưa điểm danh ra tiết chiều nay. Cần kiểm tra ngay." },
            { icon: "auto_fix_high", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", text: "TKB hiện tại có thể tối ưu thêm: 2 ràng buộc soft đang bị vi phạm nhẹ." },
          ].map((ins, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5" style={{ background: ins.bg }}>
              <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: 16, color: ins.color }}>
                {ins.icon}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "#e0e7ff" }}>{ins.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-headline font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
          Tác vụ nhanh
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/admin/tao-tkb"
            className="rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined mb-3" style={{ fontSize: 28 }}>smart_toy</span>
            <h3 className="text-lg font-headline font-bold">Tạo TKB bằng AI</h3>
            <p className="text-sm mt-1.5 opacity-80">
              Chạy thuật toán tự động xếp lịch theo ràng buộc.
            </p>
          </a>

          <a
            href="/admin/giao-vien"
            className="rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}
          >
            <span className="material-symbols-outlined mb-3" style={{ fontSize: 28 }}>group</span>
            <h3 className="text-lg font-headline font-bold">Quản lý giáo viên</h3>
            <p className="text-sm mt-1.5 opacity-80">
              Cập nhật hồ sơ, tổ/bộ môn (nhập tay) và phân công giảng dạy.
            </p>
          </a>

          <a
            href="/admin/import"
            className="rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed)" }}
          >
            <span className="material-symbols-outlined mb-3" style={{ fontSize: 28 }}>edit_note</span>
            <h3 className="text-lg font-headline font-bold">Nhập dữ liệu</h3>
            <p className="text-sm mt-1.5" style={{ color: "var(--color-on-tertiary-fixed-variant)" }}>
              Dán từ Excel hoặc nhập thủ công: giáo viên, phân công, định mức.
            </p>
          </a>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/admin/xem-tkb"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_view_week</span>
          Xem TKB giáo viên
        </a>
        <a
          href="/admin/rang-buoc"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>rule</span>
          Ràng buộc
        </a>
        <a
          href="/login-gv"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
          Trang đăng nhập GV
        </a>
      </div>
    </div>
  );
}
