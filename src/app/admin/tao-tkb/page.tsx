"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { chatWithAI, createRangBuoc, getRangBuocList, getGiaoVienList, getTKBList } from "@/lib/api";
import { MOCK_GIAO_VIEN, MOCK_PHAN_CONG } from "@/lib/mock-data";
import { THU_LABELS, getPeriodTime } from "@/lib/time-utils";
import type { GiaoVien, RangBuoc, TKBSlot } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { thu: 2, label: "T2" }, { thu: 3, label: "T3" }, { thu: 4, label: "T4" },
  { thu: 5, label: "T5" }, { thu: 6, label: "T6" }, { thu: 7, label: "T7" },
];
const PERIODS = [1, 2, 3, 4, 5];
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Toán":       { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  "Ngữ Văn":   { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  "Tiếng Anh": { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  "KHTN":       { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  "Lịch Sử":  { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  "Địa Lý":   { bg: "#ecfccb", text: "#365314", border: "#a3e635" },
  "GDCD":       { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  "Thể dục":  { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
  default:      { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};
function getColor(mon: string) { return SUBJECT_COLORS[mon] ?? SUBJECT_COLORS.default; }

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: "Cấu hình", icon: "tune" },
  { label: "Đang tạo", icon: "auto_fix_high" },
  { label: "Kết quả",  icon: "calendar_month" },
];

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: done ? "#16a34a" : active ? "var(--color-primary)" : "var(--color-surface-container)",
                  color: done || active ? "white" : "var(--color-on-surface-variant)",
                  boxShadow: active ? "0 0 0 4px color-mix(in srgb, var(--color-primary) 20%, transparent)" : undefined,
                }}
              >
                {done
                  ? <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
                  : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s.icon}</span>
                }
              </div>
              <p className="text-[10px] font-semibold whitespace-nowrap"
                style={{ color: active ? "var(--color-primary)" : done ? "#16a34a" : "var(--color-outline)" }}>
                {s.label}
              </p>
            </div>
            {i < 2 && (
              <div className="w-16 sm:w-24 h-0.5 mb-5 mx-1 transition-all"
                style={{ background: step > n + 1 ? "#16a34a" : step > n ? "var(--color-primary)" : "var(--color-outline-variant)" }} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

// ─── Mock AI constraint parser ────────────────────────────────────────────────

interface ParsedConstraint {
  mo_ta: string;
  loai: "hard" | "soft";
  entities: string[];
  actionLabel: string;
}

function mockParseConstraint(text: string): ParsedConstraint {
  const t = text.toLowerCase();
  const isSoft = t.includes("nên") || t.includes("ưu tiên") || t.includes("cố gắng") || t.includes("tốt nhất");
  const entities: string[] = [];

  // Detect teacher
  const gvMatch = MOCK_GIAO_VIEN.find((g) =>
    t.includes(g.ho_ten.toLowerCase()) ||
    t.includes(g.ho_ten.split(" ").pop()!.toLowerCase()) ||
    t.includes(g.ma_gv.toLowerCase())
  );
  if (gvMatch) entities.push(`👤 ${gvMatch.ho_ten} (${gvMatch.ma_gv})`);

  // Detect day
  const dayMatches: [string[], number][] = [
    [["thứ hai", "thứ 2", "t2"], 2], [["thứ ba", "thứ 3", "t3"], 3],
    [["thứ tư", "thứ 4", "t4"], 4], [["thứ năm", "thứ 5", "t5"], 5],
    [["thứ sáu", "thứ 6", "t6"], 6], [["thứ bảy", "thứ 7", "t7"], 7],
  ];
  const dayMatch = dayMatches.find(([keys]) => keys.some((k) => t.includes(k)));
  if (dayMatch) entities.push(`📅 ${THU_LABELS[dayMatch[1]]}`);

  // Session
  if (t.includes("sáng")) entities.push("🌅 Buổi sáng");
  else if (t.includes("chiều")) entities.push("🌆 Buổi chiều");

  // Period
  const tietMatch = t.match(/tiết\s*(\d)/);
  if (tietMatch) entities.push(`⏰ Tiết ${tietMatch[1]}`);

  // Subject
  const subjects = ["toán", "ngữ văn", "tiếng anh", "khtn", "lịch sử", "địa lý", "gdcd", "thể dục"];
  const subjectMatch = subjects.find((s) => t.includes(s));
  if (subjectMatch) entities.push(`📚 ${subjectMatch.charAt(0).toUpperCase() + subjectMatch.slice(1)}`);

  // Class
  const classMatch = t.match(/\b[6-9][a-c]\b/);
  if (classMatch) entities.push(`🏫 Lớp ${classMatch[0].toUpperCase()}`);

  const isNeg = t.includes("không") || t.includes("cấm") || t.includes("tránh");
  const actionLabel = isNeg ? "Cấm / Không phép" : isSoft ? "Ưu tiên nếu có thể" : "Bắt buộc";

  return { mo_ta: text, loai: isSoft ? "soft" : "hard", entities, actionLabel };
}

// ─── Step 1: Cấu hình ────────────────────────────────────────────────────────

function Step1Config({
  constraints,
  onToggle,
  onDelete,
  onAdd,
  onStart,
}: {
  constraints: RangBuoc[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: (rb: { mo_ta: string; loai: "hard" | "soft" }) => Promise<void>;
  onStart: () => void;
}) {
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedConstraint | null>(null);
  const [adding, setAdding] = useState(false);

  const activeCount = constraints.filter((r) => r.active).length;
  const hardCount   = constraints.filter((r) => r.loai === "hard" && r.active).length;
  const softCount   = constraints.filter((r) => r.loai === "soft" && r.active).length;

  async function handleParse() {
    if (!input.trim() || parsing) return;
    setParsed(null);
    setParsing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setParsed(mockParseConstraint(input.trim()));
    setParsing(false);
  }

  async function handleConfirmAdd() {
    if (!parsed || adding) return;
    setAdding(true);
    await onAdd({ mo_ta: parsed.mo_ta, loai: parsed.loai });
    setAdding(false);
    setParsed(null);
    setInput("");
  }

  return (
    <div className="grid lg:grid-cols-[1fr,400px] gap-6">
      {/* Left: danh sách ràng buộc */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Đang áp dụng", value: activeCount, bg: "var(--color-primary-container)", text: "var(--color-on-primary-container)" },
            { label: "Hard (bắt buộc)", value: hardCount, bg: "#fee2e2", text: "#991b1b" },
            { label: "Soft (ưu tiên)",  value: softCount, bg: "#fef3c7", text: "#92400e" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
              <p className="text-2xl font-black" style={{ color: s.text }}>{s.value}</p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: s.text, opacity: 0.8 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Constraint list */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ background: "var(--color-surface-container-low)" }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>
              Danh sách ràng buộc ({constraints.length})
            </p>
          </div>
          {constraints.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--color-outline)" }}>
              Chưa có ràng buộc nào. Thêm ở ô bên phải.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--color-outline-variant)" }}>
              {constraints.map((rb) => (
                <div key={rb.id} className="px-4 py-3 flex items-start gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => onToggle(rb.id!)}
                    className="w-9 h-5 rounded-full relative shrink-0 mt-0.5 transition-all"
                    style={{
                      background: rb.active ? "var(--color-primary)" : "var(--color-outline-variant)",
                    }}
                    title={rb.active ? "Tắt" : "Bật"}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ left: rb.active ? "1.25rem" : "0.125rem" }}
                    />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{
                      color: rb.active ? "var(--color-on-surface)" : "var(--color-outline)",
                      textDecoration: rb.active ? undefined : "line-through",
                    }}>
                      {rb.mo_ta}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          background: rb.loai === "hard" ? "#fee2e2" : "#fef9c3",
                          color: rb.loai === "hard" ? "#991b1b" : "#78350f",
                        }}>
                        {rb.loai === "hard" ? "HARD" : "SOFT"}
                      </span>
                      {rb.rule_code && (
                        <span className="text-[10px] font-mono" style={{ color: "var(--color-outline)" }}>
                          {rb.rule_code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(rb.id!)}
                    className="p-1 rounded-lg hover:opacity-70 shrink-0"
                    style={{ color: "var(--color-outline)" }}
                    title="Xóa"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary info */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "group",      label: "Giáo viên",  value: MOCK_GIAO_VIEN.filter(g => g.active).length },
            { icon: "class",      label: "Lớp học",    value: 10 },
            { icon: "assignment", label: "Phân công",  value: MOCK_PHAN_CONG.length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 flex flex-col items-center gap-1"
              style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>{s.icon}</span>
              <p className="text-xl font-black" style={{ color: "var(--color-on-surface)" }}>{s.value}</p>
              <p className="text-[10px] font-semibold" style={{ color: "var(--color-outline)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: thêm ràng buộc + bắt đầu */}
      <div className="space-y-4">
        {/* AI constraint input */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--color-outline-variant)" }}>
          <div className="px-4 py-3 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>smart_toy</span>
            <div>
              <p className="text-sm font-bold">Thêm ràng buộc bằng ngôn ngữ tự nhiên</p>
              <p className="text-[10px] opacity-75">AI sẽ phân tích và chuyển thành constraint</p>
            </div>
          </div>

          <div className="p-4 space-y-3" style={{ background: "var(--color-surface-container-lowest)" }}>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setParsed(null); }}
              rows={3}
              placeholder={'Ví dụ: "Thầy An không dạy thứ Hai sáng"\n"GVCN phải có tiết đầu thứ Hai"\n"Môn Toán nên xếp buổi sáng"'}
              className="w-full rounded-xl px-3 py-2.5 text-sm resize-none"
              style={{
                border: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container)",
                color: "var(--color-on-surface)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); void handleParse(); }
              }}
            />

            <button
              onClick={handleParse}
              disabled={!input.trim() || parsing}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}
            >
              {parsing ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                  AI đang phân tích...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>psychology</span>
                  Phân tích (Ctrl+Enter)
                </>
              )}
            </button>

            {/* Parse result */}
            {parsed && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #8b5cf6", background: "#faf5ff" }}>
                <div className="px-3 py-2 flex items-center gap-1.5"
                  style={{ background: "#ede9fe" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#6d28d9" }}>check_circle</span>
                  <p className="text-xs font-bold" style={{ color: "#4c1d95" }}>Kết quả phân tích AI</p>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: parsed.loai === "hard" ? "#fee2e2" : "#fef3c7",
                        color: parsed.loai === "hard" ? "#991b1b" : "#78350f",
                      }}>
                      {parsed.loai === "hard" ? "🔴 HARD" : "🟡 SOFT"}
                    </span>
                    <span className="text-[10px]" style={{ color: "#6d28d9" }}>{parsed.actionLabel}</span>
                  </div>
                  {parsed.entities.length > 0 && (
                    <div className="space-y-0.5">
                      {parsed.entities.map((e, i) => (
                        <p key={i} className="text-xs" style={{ color: "#4c1d95" }}>{e}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleConfirmAdd}
                      disabled={adding}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                      style={{ background: "#6d28d9", color: "white" }}
                    >
                      {adding ? "Đang thêm..." : (
                        <><span className="material-symbols-outlined" style={{ fontSize: 14 }}>add_circle</span>Thêm vào danh sách</>
                      )}
                    </button>
                    <button
                      onClick={() => { setParsed(null); setInput(""); }}
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick examples */}
            <div>
              <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--color-outline)" }}>Gợi ý nhanh:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Thầy An không dạy thứ Hai sáng",
                  "GVCN có tiết đầu sáng thứ Hai",
                  "Môn Toán nên xếp buổi sáng",
                  "Không xếp 3 tiết liên tiếp",
                ].map((ex) => (
                  <button key={ex} onClick={() => { setInput(ex); setParsed(null); }}
                    className="px-2 py-1 rounded-full text-[10px] text-left transition-all hover:opacity-80"
                    style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", border: "1px solid var(--color-outline-variant)" }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA: Bắt đầu */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-100"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>auto_fix_high</span>
          Bắt đầu tạo TKB AI
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
        </button>
        <p className="text-center text-xs" style={{ color: "var(--color-outline)" }}>
          {activeCount} ràng buộc · {MOCK_GIAO_VIEN.filter(g => g.active).length} GV · 10 lớp · {MOCK_PHAN_CONG.length} phân công
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Solver đang chạy ─────────────────────────────────────────────────

const SOLVER_LOG: { text: string; ms: number }[] = [
  { text: "Đọc dữ liệu đầu vào: 6 GV, 10 lớp, 26 phân công...",             ms: 700  },
  { text: "Phân tích ràng buộc ngôn ngữ tự nhiên bằng AI...",                ms: 1000 },
  { text: "Chuyển đổi → 5 constraint objects (3 hard, 2 soft)...",          ms: 800  },
  { text: "Khởi tạo CP-SAT solver với 300 biến quyết định...",               ms: 900  },
  { text: "Áp dụng hard constraints: NO_CONSECUTIVE_5, MAX_2_PER_DAY...",   ms: 1100 },
  { text: "Áp dụng hard constraints: GVCN_MONDAY...",                        ms: 700  },
  { text: "Áp dụng soft constraints: NO_SPLIT_SESSION, BALANCE_WEEK...",    ms: 800  },
  { text: "Chạy branch-and-bound tìm nghiệm khả thi...",                     ms: 1200 },
  { text: "Tìm được nghiệm đầu tiên! Score: 142 / 200",                      ms: 900  },
  { text: "Tối ưu hoá — cải thiện soft score: 142 → 168 → 178...",          ms: 1100 },
  { text: "Kiểm tra xung đột toàn bộ 60 tiết...",                            ms: 700  },
  { text: "✅ Hoàn thành! 60 tiết được xếp. 0 xung đột hard.",               ms: 500  },
];

function Step2Processing({ constraints, onDone }: { constraints: RangBuoc[]; onDone: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step >= SOLVER_LOG.length) { setTimeout(onDone, 600); return; }
    const { text, ms } = SOLVER_LOG[step];
    const t = setTimeout(() => {
      setLogs((p) => [...p, text]);
      setStep((s) => s + 1);
      logRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
    }, ms);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const progress = Math.round((step / SOLVER_LOG.length) * 100);
  const done = step >= SOLVER_LOG.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className="rounded-2xl p-6 text-center"
        style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${done ? "" : "animate-pulse"}`}
          style={{ background: done ? "#16a34a" : "var(--color-primary)", color: "white" }}>
          <span className={`material-symbols-outlined ${done ? "" : "animate-spin"}`} style={{ fontSize: 32 }}>
            {done ? "check_circle" : "auto_fix_high"}
          </span>
        </div>
        <h2 className="text-xl font-black mb-1">
          {done ? "Tạo TKB thành công!" : "AI đang xếp thời khoá biểu..."}
        </h2>
        <p className="text-sm opacity-80">
          {done ? "60 tiết được phân công, 0 xung đột." : `Áp dụng ${constraints.filter(r => r.active).length} ràng buộc · Đang tối ưu hoá...`}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs font-bold mb-2">
          <span style={{ color: "var(--color-on-surface-variant)" }}>Tiến độ</span>
          <span style={{ color: done ? "#16a34a" : "var(--color-primary)" }}>{progress}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--color-surface-container-high)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: done ? "#16a34a" : "var(--color-primary)" }} />
        </div>
      </div>

      {/* Log terminal */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
        <div className="px-4 py-2 flex items-center gap-2"
          style={{ background: "#1e293b" }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <p className="text-xs font-mono text-slate-400 ml-2">tkb-solver — constraint optimizer</p>
        </div>
        <div
          ref={logRef}
          className="p-4 space-y-1.5 h-56 overflow-y-auto font-mono"
          style={{ background: "#0f172a" }}
        >
          {logs.map((log, i) => (
            <p key={i} className="text-xs"
              style={{ color: log.startsWith("✅") ? "#4ade80" : i === logs.length - 1 && !done ? "#38bdf8" : "#94a3b8" }}>
              <span style={{ color: "#64748b" }}>[{String(i).padStart(2, "0")}]</span>{" "}{log}
            </p>
          ))}
          {!done && (
            <p className="text-xs" style={{ color: "#38bdf8" }}>
              <span className="animate-pulse">█</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Kết quả ──────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: "add_constraint" | "regenerate" | null;
  actionData?: { mo_ta: string; loai: "hard" | "soft" } | null;
}

function Step3Result({
  slots,
  giaoVienList,
  constraints,
  onRegenerate,
  onAddConstraint,
  onBack,
}: {
  slots: TKBSlot[];
  giaoVienList: GiaoVien[];
  constraints: RangBuoc[];
  onRegenerate: () => void;
  onAddConstraint: (data: { mo_ta: string; loai: "hard" | "soft" }) => void;
  onBack: () => void;
}) {
  const [viewMode, setViewMode] = useState<"gv" | "lop">("gv");
  const [selectedGv, setSelectedGv] = useState(giaoVienList[0]?.ma_gv ?? "");
  const [selectedLop, setSelectedLop] = useState("6/1");
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: `TKB đã tạo xong! 60 tiết · 6 GV · 10 lớp · 0 xung đột.\n\nTôi có thể giúp bạn kiểm tra tải trọng, tìm lỗi, hoặc thêm ràng buộc mới và tạo lại.`,
  }]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content:
            "🔍 Tôi vừa phân tích TKB vừa tạo và phát hiện một số điểm cần lưu ý:\n\n" +
            "• GV004 (Phạm Thu Dung) đang dạy 4 tiết liên tiếp T1–T4 buổi sáng thứ 3 — có thể gây mệt mỏi.\n" +
            "• GV001 (Nguyễn Văn An) có 2 tiết Toán cùng lớp 6/1 vào 2 buổi liên tiếp — nên cân nhắc giãn ra.\n\n" +
            "Bạn có muốn tôi thêm ràng buộc để tránh các tình huống này không?",
        },
      ]);
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const gvList = Array.from(new Set(slots.map((s) => s.ma_gv)));
  const lopList = Array.from(new Set(slots.map((s) => s.lop))).sort();

  const displaySlots = viewMode === "gv"
    ? slots.filter((s) => s.ma_gv === selectedGv)
    : slots.filter((s) => s.lop === selectedLop);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendChat(text?: string) {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setChatLoading(true);
    try {
      const res = await chatWithAI({ message: msg });
      const actionData = res.action_data?.mo_ta
        ? { mo_ta: res.action_data.mo_ta, loai: (res.action_data.loai ?? "hard") as "hard" | "soft" }
        : null;
      setMessages((p) => [...p, { role: "assistant", content: res.reply, action: res.action ?? null, actionData }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Lỗi kết nối AI." }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Result banner */}
      <div className="rounded-2xl p-4 flex flex-wrap items-center gap-4"
        style={{ background: "#dcfce7", border: "1px solid #86efac" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, color: "#16a34a" }}>check_circle</span>
        <div className="flex-1">
          <p className="font-bold text-lg" style={{ color: "#14532d" }}>Tạo TKB thành công!</p>
          <p className="text-sm" style={{ color: "#166534" }}>
            60 tiết · {gvList.length} GV · {lopList.length} lớp · {constraints.filter(r => r.active).length} ràng buộc · 0 xung đột
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack}
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            style={{ background: "white", color: "#166534", border: "1px solid #86efac" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_back</span>
            Chỉnh ràng buộc
          </button>
          <button onClick={onRegenerate}
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
            Tạo lại
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,360px] gap-6">
        {/* TKB Viewer */}
        <div className="space-y-3">
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "var(--color-surface-container)" }}>
            {(["gv", "lop"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: viewMode === m ? "var(--color-primary)" : "transparent",
                  color: viewMode === m ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{m === "gv" ? "person" : "class"}</span>
                {m === "gv" ? "Theo giáo viên" : "Theo lớp"}
              </button>
            ))}
          </div>

          {/* Selector chips */}
          {viewMode === "gv" ? (
            <div className="flex flex-wrap gap-1.5">
              {gvList.map((ma) => {
                const gv = giaoVienList.find((g) => g.ma_gv === ma);
                return (
                  <button key={ma} onClick={() => setSelectedGv(ma)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: selectedGv === ma ? "var(--color-primary)" : "var(--color-surface-container)",
                      color: selectedGv === ma ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                    }}>
                    {gv?.ho_ten.split(" ").pop() ?? ma}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {lopList.map((l) => (
                <button key={l} onClick={() => setSelectedLop(l)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: selectedLop === l ? "var(--color-primary)" : "var(--color-surface-container)",
                    color: selectedLop === l ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                  }}>
                  {l}
                </button>
              ))}
            </div>
          )}

          {/* Info bar */}
          {viewMode === "gv" && selectedGv && (() => {
            const gv = giaoVienList.find((g) => g.ma_gv === selectedGv);
            const count = displaySlots.length;
            return (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                <span className="font-bold">{gv?.ho_ten}</span>
                <span className="opacity-70">· {gv?.to_chuyen_mon}</span>
                <span className="ml-auto font-bold">{count} tiết/tuần</span>
              </div>
            );
          })()}

          {/* TKB Grid */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 460 }}>
                <thead>
                  <tr style={{ background: "var(--color-primary)" }}>
                    <th className="p-2 text-left font-bold w-12"
                      style={{ color: "var(--color-on-primary)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>Tiết</th>
                    {DAYS.map((d, i) => (
                      <th key={d.thu} className="p-2 text-center font-bold"
                        style={{ color: "var(--color-on-primary)", borderRight: i < 5 ? "1px solid rgba(255,255,255,0.2)" : undefined }}>
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(["sang", "chieu"] as const).map((buoi) => (
                    <Fragment key={buoi}>
                      <tr>
                        <td colSpan={7} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                          style={{ background: buoi === "sang" ? "#eff6ff" : "#f0fdf4", color: buoi === "sang" ? "#1d4ed8" : "#15803d" }}>
                          {buoi === "sang" ? "☀ Sáng" : "🌤 Chiều"}
                        </td>
                      </tr>
                      {PERIODS.map((tiet) => {
                        const pt = getPeriodTime(buoi, tiet);
                        return (
                          <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                            <td className="p-1.5 text-center"
                              style={{ color: "var(--color-outline)", background: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-outline-variant)" }}>
                              <p className="font-bold">{tiet}</p>
                              <p className="text-[9px]">{pt.start}</p>
                            </td>
                            {DAYS.map((d, di) => {
                              const slot = displaySlots.find((s) => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                              if (!slot) return (
                                <td key={d.thu} className="p-1"
                                  style={{ borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined }}>
                                  <div className="h-10 rounded-lg" style={{ background: "rgba(0,0,0,0.01)" }} />
                                </td>
                              );
                              const c = getColor(slot.mon);
                              const label = viewMode === "gv" ? slot.lop : (giaoVienList.find((g) => g.ma_gv === slot.ma_gv)?.ho_ten.split(" ").pop() ?? slot.ma_gv);
                              return (
                                <td key={d.thu} className="p-1"
                                  style={{ borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined }}>
                                  <div className="h-10 rounded-lg px-1.5 py-1 flex flex-col justify-center"
                                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                                    <p className="font-black truncate" style={{ color: c.text, fontSize: 9 }}>{slot.mon}</p>
                                    <p className="font-bold truncate" style={{ color: c.text, fontSize: 9 }}>{label}</p>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chat AI */}
        <div className="flex flex-col rounded-2xl overflow-hidden"
          style={{ height: 520, border: "1px solid var(--color-outline-variant)" }}>
          {/* Chat header */}
          <div className="px-4 py-3 flex items-center gap-2 shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "white" }}>smart_toy</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Trợ lý AI TKB</p>
              <p className="text-[10px] text-white opacity-75">Hỏi về lịch, GV, ràng buộc...</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-white opacity-80">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0"
            style={{ background: "var(--color-surface-container-lowest)" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#ede9fe" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#6d28d9" }}>smart_toy</span>
                  </div>
                )}
                <div className="max-w-[85%] space-y-1.5">
                  <div className="px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap"
                    style={{
                      background: msg.role === "user" ? "#6366f1" : "var(--color-surface-container-high)",
                      color: msg.role === "user" ? "white" : "var(--color-on-surface)",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    }}>
                    {msg.content}
                  </div>
                  {msg.action === "add_constraint" && msg.actionData && (
                    <button onClick={() => { onAddConstraint(msg.actionData!); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold"
                      style={{ background: "#ede9fe", color: "#6d28d9" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>add_circle</span>
                      Thêm ràng buộc này
                    </button>
                  )}
                  {msg.action === "regenerate" && (
                    <button onClick={onRegenerate}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold"
                      style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>refresh</span>
                      Tạo lại TKB
                    </button>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#ede9fe" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#6d28d9" }}>smart_toy</span>
                </div>
                <div className="px-3 py-2.5 rounded-2xl flex items-center gap-1"
                  style={{ background: "var(--color-surface-container-high)", borderRadius: "18px 18px 18px 4px" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#8b5cf6", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto shrink-0"
            style={{ borderTop: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}>
            {["Tải trọng GV", "Có xung đột không?", "Lịch lớp 6/1", "Thêm ràng buộc", "Tạo lại"].map((s) => (
              <button key={s} onClick={() => sendChat(s)}
                className="px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap shrink-0 transition-all hover:opacity-80"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", border: "1px solid var(--color-outline-variant)" }}>
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-2.5 flex gap-2 shrink-0"
            style={{ borderTop: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}>
            <input
              className="flex-1 px-3 py-2 rounded-xl text-xs"
              style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)", border: "none", outline: "none" }}
              placeholder="Hỏi về TKB, ràng buộc..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
              disabled={chatLoading}
            />
            <button onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
              style={{ background: "#6366f1", color: "white" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TaoTkbPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [constraints, setConstraints] = useState<RangBuoc[]>([]);
  const [slots, setSlots] = useState<TKBSlot[]>([]);
  const [giaoVienList, setGiaoVienList] = useState<GiaoVien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRangBuocList(), getGiaoVienList(), getTKBList()]).then(([rb, gv, tkb]) => {
      setConstraints(rb);
      setGiaoVienList(gv);
      setSlots(tkb);
      setLoading(false);
    });
  }, []);

  function handleToggle(id: number) {
    setConstraints((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  }

  function handleDelete(id: number) {
    setConstraints((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleAdd(data: { mo_ta: string; loai: "hard" | "soft" }) {
    const newRb = await createRangBuoc(data);
    setConstraints((prev) => [...prev, newRb]);
  }

  function handleAddConstraintFromChat(data: { mo_ta: string; loai: "hard" | "soft" }) {
    void handleAdd(data);
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-2xl p-8 text-center animate-pulse" style={{ background: "var(--color-surface-container-lowest)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-3" style={{ background: "var(--color-surface-container)" }} />
          <div className="h-4 w-40 rounded mx-auto" style={{ background: "var(--color-surface-container)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
          Tạo thời khoá biểu AI
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Nhập ràng buộc bằng ngôn ngữ tự nhiên — AI phân tích và solver tự động xếp TKB tối ưu.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* Step content */}
      {step === 1 && (
        <Step1Config
          constraints={constraints}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onStart={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Processing
          constraints={constraints}
          onDone={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3Result
          slots={slots}
          giaoVienList={giaoVienList}
          constraints={constraints}
          onRegenerate={() => setStep(2)}
          onAddConstraint={handleAddConstraintFromChat}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
