"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginGv, setGvSession } from "@/lib/mock-auth";
import { GV_ACCOUNTS } from "@/lib/mock-data";

export default function LoginGvPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const account = loginGv(username, password);
    if (!account) {
      setError("Sai tài khoản hoặc mật khẩu");
      setLoading(false);
      return;
    }
    setGvSession(account);
    router.push("/lich");
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
              THCS Nguyễn Thiện Thuật
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
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"
              style={{ background: "var(--color-primary)", opacity: 0.06 }} />

            <div className="relative z-10">
              <h1 className="font-headline font-bold text-3xl mb-2 tracking-tight" style={{ color: "var(--color-primary)" }}>
                Đăng nhập
              </h1>
              <p className="font-body text-base leading-relaxed mb-8" style={{ color: "var(--color-on-surface-variant)" }}>
                Nhập tài khoản để xem lịch dạy và điểm danh
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block font-label text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ml-1"
                    style={{ color: "var(--color-outline)" }}>
                    Tài khoản
                  </label>
                  <div className="relative flex items-center rounded-xl overflow-hidden"
                    style={{ background: "var(--color-surface-container-highest)" }}>
                    <span className="material-symbols-outlined absolute left-4"
                      style={{ color: "var(--color-outline)", fontSize: 22 }}>person</span>
                    <input
                      className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-4 font-body text-base"
                      style={{ color: "var(--color-on-surface)" }}
                      placeholder="Tên đăng nhập"
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      autoFocus
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block font-label text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ml-1"
                    style={{ color: "var(--color-outline)" }}>
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center rounded-xl overflow-hidden"
                    style={{ background: "var(--color-surface-container-highest)" }}>
                    <span className="material-symbols-outlined absolute left-4"
                      style={{ color: "var(--color-outline)", fontSize: 22 }}>lock</span>
                    <input
                      className="w-full bg-transparent border-none outline-none py-4 pl-12 pr-12 font-body text-base"
                      style={{ color: "var(--color-on-surface)" }}
                      placeholder="Mật khẩu"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 opacity-60 hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-outline)" }}>
                        {showPass ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
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

              {/* Demo accounts */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: "var(--color-surface-container)" }}>
                <p className="font-semibold text-xs mb-3 flex items-center gap-1.5" style={{ color: "var(--color-on-surface)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--color-primary)" }}>info</span>
                  Tài khoản demo (mật khẩu đều là <code className="font-mono font-bold" style={{ color: "var(--color-primary)" }}>123456</code>)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {GV_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => { setUsername(acc.username); setPassword("123456"); setError(""); }}
                      className="text-left px-3 py-2 rounded-lg text-xs transition-all hover:scale-[1.02]"
                      style={{
                        background: "var(--color-surface-container-lowest)",
                        color: "var(--color-on-surface-variant)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      <p className="font-bold truncate" style={{ color: "var(--color-on-surface)" }}>{acc.ho_ten}</p>
                      <p className="font-mono opacity-70">{acc.username}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 text-center">
                <Link href="/" className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                  Quay lại trang chủ
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "var(--color-tertiary-fixed)" }}>
              <span className="material-symbols-outlined"
                style={{ fontSize: 16, color: "var(--color-on-tertiary-fixed-variant)", fontVariationSettings: "'FILL' 1" }}>
                fingerprint
              </span>
              <span className="font-label text-[11px] font-bold tracking-wider uppercase"
                style={{ color: "var(--color-on-tertiary-fixed-variant)" }}>
                Điểm danh bằng camera
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 flex justify-center">
        <p className="font-body text-sm font-medium tracking-wide" style={{ color: "var(--color-outline)" }}>
          Năm học 2025–2026 · Học kỳ II
        </p>
      </footer>
    </div>
  );
}
