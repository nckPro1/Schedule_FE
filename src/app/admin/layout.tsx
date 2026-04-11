"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/diem-danh", icon: "fingerprint", label: "Quản lý điểm danh" },
  { href: "/admin/giao-vien", icon: "group", label: "Quản lý giáo viên" },
  { href: "/admin/lop-hoc", icon: "class", label: "Quản lý lớp học" },
  { href: "/admin/dinh-muc", icon: "tune", label: "Quản lý định mức" },
  { href: "/admin/rang-buoc", icon: "rule", label: "Quản lý ràng buộc" },
  { href: "/admin/xem-tkb", icon: "calendar_view_week", label: "Xem TKB" },
  { href: "/admin/tao-tkb", icon: "smart_toy", label: "Tạo TKB (AI)" },
  { href: "/admin/import", icon: "edit_note", label: "Nhập dữ liệu" },
];

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
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--color-surface-container)" }}
          >
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
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--color-error)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
            Thoát
          </Link>
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
