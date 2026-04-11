"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginAdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (username.trim().toLowerCase() === "admin" && password === "123") {
        router.push("/admin");
      } else {
        setError("Sai tài khoản hoặc mật khẩu");
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
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-xl tracking-tight" style={{ color: "var(--color-primary)" }}>
              TKB AI System
            </span>
            <span className="font-label text-[11px] font-semibold tracking-widest uppercase" style={{ color: "var(--color-outline)" }}>
              Quản trị viên
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div
            className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
            style={{
              background: "var(--color-surface-container-lowest)",
              boxShadow: "0 12px 32px rgba(30,58,138,0.07)",
            }}
          >
            {/* Decorative */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"
              style={{ background: "var(--color-primary)", opacity: 0.06 }}
            />

            <div className="relative z-10">
              <h1 className="font-headline font-bold text-3xl mb-2 tracking-tight" style={{ color: "var(--color-primary)" }}>
                Đăng nhập Admin
              </h1>
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
                Nhập tài khoản quản trị để truy cập hệ thống
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                  <label
                    className="block font-label text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ml-1"
                    style={{ color: "var(--color-outline)" }}
                  >
                    Tài khoản
                  </label>
                  <div
                    className="relative flex items-center rounded-xl overflow-hidden"
                    style={{ background: "var(--color-surface-container-highest)" }}
                  >
                    <span
                      className="material-symbols-outlined absolute left-4"
                      style={{ color: "var(--color-outline)", fontSize: 22 }}
                    >
                      person
                    </span>
                    <input
                      className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-4 font-body text-base"
                      style={{ color: "var(--color-on-surface)" }}
                      placeholder="Nhập tài khoản"
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block font-label text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ml-1"
                    style={{ color: "var(--color-outline)" }}
                  >
                    Mật khẩu
                  </label>
                  <div
                    className="relative flex items-center rounded-xl overflow-hidden"
                    style={{ background: "var(--color-surface-container-highest)" }}
                  >
                    <span
                      className="material-symbols-outlined absolute left-4"
                      style={{ color: "var(--color-outline)", fontSize: 22 }}
                    >
                      lock
                    </span>
                    <input
                      className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-4 font-body text-base"
                      style={{ color: "var(--color-on-surface)" }}
                      placeholder="Nhập mật khẩu"
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: "var(--color-error-container)",
                      color: "var(--color-on-error-container)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                    {error}
                  </div>
                )}

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
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo hint */}
              <div
                className="mt-6 p-4 rounded-xl text-sm"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
              >
                <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>
                  🧪 Tài khoản demo:
                </p>
                <p className="font-mono text-xs">
                  Tài khoản: <strong style={{ color: "var(--color-primary)" }}>admin</strong> · Mật khẩu: <strong style={{ color: "var(--color-primary)" }}>123</strong>
                </p>
              </div>

              {/* Back link */}
              <div className="mt-5 text-center">
                <Link
                  href="/"
                  className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Quay lại trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex flex-col items-center gap-2">
        <p className="font-body text-sm font-medium tracking-wide" style={{ color: "var(--color-outline)" }}>
          Năm học 2025–2026 · Học kỳ II
        </p>
      </footer>
    </div>
  );
}
