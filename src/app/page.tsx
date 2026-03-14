export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>school</span>
          </div>
          <h1 className="font-headline font-bold text-2xl tracking-tight" style={{ color: "var(--color-primary)" }}>
            TKB AI System
          </h1>
          <p className="font-label text-xs font-semibold tracking-widest uppercase mt-1" style={{ color: "var(--color-outline)" }}>
            THCS Hòa Xuân · Năm học 2025–2026
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <a
            href="/login-gv"
            className="block rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "var(--color-surface-container-lowest)",
              boxShadow: "0 4px 16px rgba(30,58,138,0.06)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>person</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-headline font-bold text-lg" style={{ color: "var(--color-on-surface)" }}>
                  Giáo viên
                </h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
                  Tra cứu lịch dạy cá nhân bằng mã giáo viên
                </p>
              </div>
              <span className="material-symbols-outlined flex-shrink-0 ml-auto" style={{ color: "var(--color-outline)", fontSize: 20 }}>
                arrow_forward
              </span>
            </div>
          </a>

          <a
            href="/login-admin"
            className="block rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{
              background: "var(--color-surface-container-lowest)",
              boxShadow: "0 4px 16px rgba(30,58,138,0.06)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>admin_panel_settings</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-headline font-bold text-lg" style={{ color: "var(--color-on-surface)" }}>
                  Quản trị viên
                </h2>
                <p className="text-sm mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
                  Quản lý TKB, giáo viên, import dữ liệu
                </p>
              </div>
              <span className="material-symbols-outlined flex-shrink-0 ml-auto" style={{ color: "var(--color-outline)", fontSize: 20 }}>
                arrow_forward
              </span>
            </div>
          </a>
        </div>

        {/* Footer badge */}
        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: "var(--color-tertiary-fixed)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 16, color: "var(--color-on-tertiary-fixed-variant)", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span
              className="font-label text-[10px] font-bold tracking-wider uppercase"
              style={{ color: "var(--color-on-tertiary-fixed-variant)" }}
            >
              Hệ thống đã cập nhật tuần 24
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
