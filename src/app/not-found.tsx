import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}
    >
      {/* Icon */}
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 48 }}>search_off</span>
      </div>

      {/* Text */}
      <h1
        className="text-6xl font-headline font-black mb-2"
        style={{ color: "var(--color-primary)" }}
      >
        404
      </h1>
      <p className="text-xl font-bold mb-2" style={{ color: "var(--color-on-surface)" }}>
        Không tìm thấy trang
      </p>
      <p className="text-sm mb-8 max-w-xs" style={{ color: "var(--color-on-surface-variant)" }}>
        Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>home</span>
          Về trang chủ
        </Link>
        <Link
          href="/lich"
          className="px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
          Thời khóa biểu
        </Link>
      </div>
    </div>
  );
}
