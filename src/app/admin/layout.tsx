"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getAllRecords } from "@/lib/attendance-store";
import type { DiemDanhRecord } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/admin",              icon: "dashboard",          label: "Dashboard" },
  { href: "/admin/diem-danh",    icon: "fingerprint",        label: "Quản lý điểm danh" },
  { href: "/admin/giao-vien",    icon: "group",              label: "Quản lý giáo viên" },
  { href: "/admin/lop-hoc",      icon: "class",              label: "Quản lý lớp học" },
  { href: "/admin/dinh-muc",     icon: "tune",               label: "Quản lý định mức" },
  { href: "/admin/rang-buoc",    icon: "rule",               label: "Quản lý ràng buộc" },
  { href: "/admin/xem-tkb",      icon: "calendar_view_week", label: "Xem TKB" },
  { href: "/admin/tao-tkb",      icon: "smart_toy",          label: "Tạo TKB (AI)" },
  { href: "/admin/import",       icon: "edit_note",          label: "Nhập dữ liệu" },
];

const ALERT_STATUSES = ["muon", "tre", "vang_mat"] as const;
type AlertStatus = typeof ALERT_STATUSES[number];

const STATUS_NOTIF: Record<AlertStatus, { label: string; color: string; bg: string; icon: string }> = {
  muon:     { label: "Muộn",     color: "#92400e", bg: "#fef3c7", icon: "schedule" },
  tre:      { label: "Trễ",      color: "#7c2d12", bg: "#ffedd5", icon: "warning"  },
  vang_mat: { label: "Vắng mặt", color: "#991b1b", bg: "#fee2e2", icon: "cancel"   },
};

const NOTIF_READ_KEY = "admin_notif_read";

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(NOTIF_READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

function persistReadIds(ids: Set<string>) {
  localStorage.setItem(NOTIF_READ_KEY, JSON.stringify([...ids]));
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [alerts, setAlerts] = useState<DiemDanhRecord[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropRef = useRef<HTMLDivElement>(null);

  function reload() {
    const all = getAllRecords();
    const filtered = all
      .filter((r) => (ALERT_STATUSES as readonly string[]).includes(r.trang_thai))
      .sort((a, b) =>
        (b.ngay + b.buoi + String(b.tiet)).localeCompare(a.ngay + a.buoi + String(a.tiet))
      )
      .slice(0, 30);
    setAlerts(filtered);
    setReadIds(getReadIds());
  }

  useEffect(() => {
    reload();
    const id = setInterval(reload, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đóng khi click ra ngoài
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unread = alerts.filter((a) => !readIds.has(a.id)).length;
  const pendingGiaiTrinh = alerts.filter((a) => a.da_giai_trinh && !a.xu_ly_giai_trinh).length;

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const newRead = new Set(readIds);
      alerts.forEach((a) => newRead.add(a.id));
      persistReadIds(newRead);
      setReadIds(newRead);
    }
  }

  function markAllRead() {
    const newRead = new Set(readIds);
    alerts.forEach((a) => newRead.add(a.id));
    persistReadIds(newRead);
    setReadIds(newRead);
  }

  return (
    <div className="relative" ref={dropRef}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
        style={{ background: open ? "var(--color-primary-container)" : "var(--color-surface-container)" }}
        title="Thông báo điểm danh"
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 20,
            color: open ? "var(--color-on-primary-container)" : "var(--color-on-surface-variant)",
            fontVariationSettings: unread > 0 ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          notifications
        </span>
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-0.5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
            style={{ background: "#ef4444", lineHeight: 1 }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl shadow-2xl z-100 overflow-hidden"
          style={{
            border: "1px solid var(--color-outline-variant)",
            background: "var(--color-surface-container-lowest)",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--color-outline-variant)" }}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#ef4444" }}>
                notifications_active
              </span>
              <p className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>
                Cảnh báo điểm danh
              </p>
              {alerts.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface-variant)" }}
                >
                  {alerts.length}
                </span>
              )}
            </div>
            {alerts.some((a) => !readIds.has(a.id)) && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: "var(--color-outline)", fontVariationSettings: "'FILL' 1" }}>
                  notifications_off
                </span>
                <p className="text-sm" style={{ color: "var(--color-outline)" }}>Không có cảnh báo</p>
              </div>
            ) : (
              alerts.map((r) => {
                const cfg = STATUS_NOTIF[r.trang_thai as AlertStatus];
                const isNew = !readIds.has(r.id);
                const timeIn = r.thoi_gian_vao
                  ? new Date(r.thoi_gian_vao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                  : null;
                return (
                  <div
                    key={r.id}
                    className="px-4 py-3 flex items-start gap-2.5"
                    style={{
                      borderBottom: "1px solid var(--color-outline-variant)",
                      background: isNew ? cfg.bg + "55" : undefined,
                    }}
                  >
                    {/* Dot */}
                    <div className="shrink-0 mt-1">
                      {isNew
                        ? <span className="block w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
                        : <span className="block w-2 h-2" />
                      }
                    </div>

                    {/* Icon */}
                    <span
                      className="material-symbols-outlined shrink-0 mt-0.5"
                      style={{ fontSize: 18, color: cfg.color, fontVariationSettings: "'FILL' 1" }}
                    >
                      {cfg.icon}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "var(--color-on-surface)" }}>
                        {r.ho_ten_gv}
                      </p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--color-on-surface-variant)" }}>
                        {r.lop} · {r.mon} · Tiết {r.tiet} {r.buoi === "sang" ? "sáng" : "chiều"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: cfg.bg, color: cfg.color, fontSize: 9 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>
                            {cfg.icon}
                          </span>
                          {cfg.label}
                          {r.tre_phut != null && r.tre_phut > 0 && ` ${r.tre_phut} phút`}
                        </span>
                        <span className="text-[9px]" style={{ color: "var(--color-outline)" }}>
                          {r.ngay}
                          {timeIn && ` · vào ${timeIn}`}
                        </span>
                      </div>
                      {r.da_giai_trinh && !r.xu_ly_giai_trinh && (
                        <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: "#fef3c7", color: "#854d0e", fontSize: 9 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 10 }}>hourglass_empty</span>
                          Có giải trình chờ xử lý
                        </span>
                      )}
                      {r.ghi_chu && (
                        <p className="text-[9px] mt-1 italic truncate" style={{ color: "var(--color-outline)" }}>
                          "{r.ghi_chu}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-2.5 flex items-center justify-between gap-2"
            style={{ borderTop: "1px solid var(--color-outline-variant)" }}
          >
            {pendingGiaiTrinh > 0 ? (
              <a href="/admin/diem-danh?filter=cho_xu_ly"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold hover:opacity-80"
                style={{ background: "#fef3c7", color: "#854d0e" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>hourglass_empty</span>
                {pendingGiaiTrinh} chờ xử lý
              </a>
            ) : (
              <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>
                Cập nhật mỗi 30 giây
              </p>
            )}
            <a
              href="/admin/diem-danh"
              className="text-xs font-semibold hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              Xem tất cả →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex-shrink-0 hidden lg:flex flex-col h-screen sticky top-0"
        style={{ background: "var(--color-surface-container-low)" }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>school</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-base leading-tight" style={{ color: "var(--color-on-surface)" }}>
              TKB AI
            </h2>
            <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: "var(--color-outline)" }}>
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--color-primary-container)" : "transparent",
                  color: active ? "var(--color-on-primary-container)" : "var(--color-on-surface-variant)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 20,
                    fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 mt-auto">
          <div className="rounded-xl p-3" style={{ background: "var(--color-surface-container)" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed)" }}
              >
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--color-on-surface)" }}>Admin</p>
                <p className="text-[10px] truncate" style={{ color: "var(--color-outline)" }}>Quản trị viên</p>
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ color: "var(--color-error)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Desktop top bar */}
        <div
          className="hidden lg:flex items-center justify-end px-6 py-3 sticky top-0 z-30"
          style={{
            background: "var(--color-surface-container-lowest)",
            borderBottom: "1px solid var(--color-outline-variant)",
          }}
        >
          <NotificationBell />
        </div>

        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{
            background: "var(--color-surface-container-lowest)",
            borderBottom: "1px solid var(--color-outline-variant)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>school</span>
            </div>
            <span className="font-headline font-bold text-sm" style={{ color: "var(--color-primary)" }}>
              TKB AI Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link
              href="/"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "var(--color-error)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
              Thoát
            </Link>
          </div>
        </header>

        {/* Mobile nav */}
        <nav
          className="lg:hidden flex overflow-x-auto gap-1 px-3 py-2 sticky top-[49px] z-20"
          style={{
            background: "var(--color-surface-container-low)",
            borderBottom: "1px solid var(--color-outline-variant)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                style={{
                  background: active ? "var(--color-primary-container)" : "transparent",
                  color: active ? "var(--color-on-primary-container)" : "var(--color-on-surface-variant)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
