import { tkbSummaryMock } from "@/lib/mock-data";

export default function AdminPage() {
  const stats = tkbSummaryMock;

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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Giáo viên", value: stats.so_gv, icon: "group", color: "var(--color-primary)" },
          { label: "Lớp học", value: stats.so_lop, icon: "school", color: "var(--color-tertiary)" },
          { label: "Ràng buộc", value: stats.so_rang_buoc, icon: "rule", color: "var(--color-secondary)" },
          { label: "Phân công", value: stats.so_phan_cong, icon: "assignment", color: "var(--color-primary)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5"
            style={{
              background: "var(--color-surface-container-lowest)",
              boxShadow: "0 2px 8px rgba(30,58,138,0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>
                {s.icon}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>
                {s.label}
              </span>
            </div>
            <p className="text-3xl font-headline font-extrabold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
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
              Cập nhật hồ sơ, tổ bộ môn và phân công giảng dạy.
            </p>
          </a>

          <a
            href="/admin/import"
            className="rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ background: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed)" }}
          >
            <span className="material-symbols-outlined mb-3" style={{ fontSize: 28 }}>upload_file</span>
            <h3 className="text-lg font-headline font-bold">Import Excel</h3>
            <p className="text-sm mt-1.5" style={{ color: "var(--color-on-tertiary-fixed-variant)" }}>
              Nhập dữ liệu lớp, phòng, giáo viên từ biểu mẫu Excel.
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
