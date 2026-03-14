"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getGiaoVienByMa } from "@/lib/mock-data";

export default function LoginGvPage() {
  const router = useRouter();
  const [maGv, setMaGv] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = maGv.trim();
    if (!trimmed) {
      setError("Vui lòng nhập mã giáo viên");
      return;
    }

    setLoading(true);

    // Simulate a brief lookup delay
    setTimeout(() => {
      const gv = getGiaoVienByMa(trimmed);
      if (gv) {
        router.push(`/lich?gv=${encodeURIComponent(gv.ma_gv)}`);
      } else {
        setError(`Không tìm thấy giáo viên với mã "${trimmed}"`);
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
      {/* Header */}
      <header className="w-full pt-10 pb-2 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>school</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-xl tracking-tight" style={{ color: "var(--color-primary)" }}>
              TKB AI System
            </span>
            <span className="font-label text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--color-outline)" }}>
              THCS Hòa Xuân
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          {/* Card */}
          <div
            className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
            style={{
              background: "var(--color-surface-container-lowest)",
              boxShadow: "0 12px 32px rgba(30,58,138,0.07)",
            }}
          >
            {/* Decorative blobs */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"
              style={{ background: "var(--color-primary)", opacity: 0.06 }}
            />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full -ml-12 -mb-12 blur-2xl pointer-events-none"
              style={{ background: "var(--color-on-tertiary-container)", opacity: 0.05 }}
            />

            <div className="relative z-10">
              <h1 className="font-headline font-bold text-3xl mb-2 tracking-tight" style={{ color: "var(--color-primary)" }}>
                Tra cứu lịch dạy
              </h1>
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
                Nhập mã giáo viên để xem thời khoá biểu cá nhân
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="block font-label text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ml-1"
                    style={{ color: "var(--color-outline)" }}
                  >
                    Mã giáo viên
                  </label>
                  <div
                    className="relative flex items-center rounded-xl overflow-hidden transition-all"
                    style={{ background: "var(--color-surface-container-highest)" }}
                  >
                    <span
                      className="material-symbols-outlined absolute left-4"
                      style={{ color: "var(--color-outline)", fontSize: 22 }}
                    >
                      person_search
                    </span>
                    <input
                      className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-4 font-body text-base"
                      style={{ color: "var(--color-on-surface)" }}
                      placeholder="Nhập mã GV (vd: kiennc, phucdq)"
                      type="text"
                      value={maGv}
                      onChange={(e) => {
                        setMaGv(e.target.value);
                        if (error) setError("");
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <div
                      className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{
                        background: "var(--color-error-container)",
                        color: "var(--color-on-error-container)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                      {error}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 font-headline font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
                    color: "var(--color-on-primary)",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>progress_activity</span>
                      <span>Đang tìm...</span>
                    </>
                  ) : (
                    <>
                      <span>Xem lịch dạy</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back link */}
              <div className="mt-5 text-center">
                <a
                  href="/"
                  className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Quay lại trang chủ
                </a>
              </div>

              {/* Demo hint */}
              <div
                className="mt-4 p-4 rounded-xl text-sm"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--color-on-surface)" }}>
                  🧪 Mã GV demo:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setMaGv("kiennc"); setError(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
                  >
                    kiennc — Toán 9/3, 9/6
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMaGv("phucdq"); setError(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                    style={{ background: "var(--color-tertiary-fixed)", color: "var(--color-on-tertiary-fixed)" }}
                  >
                    phucdq — Văn 8/5, 8/2, 8/3
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-6 flex justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "var(--color-tertiary-fixed)" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "var(--color-on-tertiary-fixed-variant)", fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span
                className="font-label text-[11px] font-bold tracking-wider uppercase"
                style={{ color: "var(--color-on-tertiary-fixed-variant)" }}
              >
                Hệ thống đã cập nhật tuần 24
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex flex-col items-center gap-2">
        <p className="font-body text-sm font-medium tracking-wide" style={{ color: "var(--color-outline)" }}>
          Năm học 2025–2026 · Học kỳ II
        </p>
        <div className="w-12 h-px" style={{ background: "var(--color-outline-variant)", opacity: 0.3 }} />
        <div className="flex gap-6 mt-2">
          {["Privacy", "Support", "School Portal"].map((label) => (
            <span
              key={label}
              className="font-label text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:opacity-80"
              style={{ color: "var(--color-outline-variant)" }}
            >
              {label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
