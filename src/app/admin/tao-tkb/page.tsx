"use client";

import { useState, useRef, useEffect } from "react";
import { tkbSummaryMock, tkbMock, phanCongMock, giaoVienMock, canhBaoMock, rangBuocMock } from "@/lib/mock-data";
import type { TKBSlot, CanhBao } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  action?: "add_constraint" | "regenerate" | null;
  actionData?: { mo_ta: string; loai: "hard" | "soft" } | null;
  loading?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = [
  { thu: 2, label: "T2" },
  { thu: 3, label: "T3" },
  { thu: 4, label: "T4" },
  { thu: 5, label: "T5" },
  { thu: 6, label: "T6" },
  { thu: 7, label: "T7" },
];
const PERIODS = [1, 2, 3, 4, 5];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Toán":       { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
  "Ngữ Văn":    { bg: "#fce7f3", text: "#831843", border: "#f9a8d4" },
  "Tiếng Anh":  { bg: "#d1fae5", text: "#064e3b", border: "#6ee7b7" },
  "KHTN":       { bg: "#ffedd5", text: "#7c2d12", border: "#fdba74" },
  "Lịch Sử":   { bg: "#fef9c3", text: "#713f12", border: "#fde047" },
  "Địa Lý":    { bg: "#ecfccb", text: "#365314", border: "#a3e635" },
  "GDCD":       { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
  default:      { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};
function getColor(mon: string) { return SUBJECT_COLORS[mon] ?? SUBJECT_COLORS.default; }

// ─── Mock AI responses ────────────────────────────────────────────────────────
const AI_RESPONSES: { keywords: string[]; reply: string; action?: ChatMessage["action"]; actionData?: ChatMessage["actionData"] }[] = [
  {
    keywords: ["trùng", "conflict", "lỗi"],
    reply: "Tôi đã kiểm tra TKB hiện tại. Phát hiện 1 cảnh báo soft: thầy Đặng Quốc Phúc có 2 tiết liên tiếp buổi sáng Thứ 5. Không có xung đột hard nào.",
  },
  {
    keywords: ["thêm ràng buộc", "ràng buộc", "constraint"],
    reply: "Tôi hiểu bạn muốn thêm ràng buộc mới. Bạn có thể mô tả cụ thể hơn không? Ví dụ: \"Giáo viên chủ nhiệm không dạy tiết 1 thứ 2\" hoặc \"Không xếp quá 3 tiết liên tiếp\".",
  },
  {
    keywords: ["không dạy tiết 1", "tiết 1 thứ 2", "chủ nhiệm"],
    reply: "Đã phân tích yêu cầu. Tôi sẽ thêm ràng buộc: \"GV chủ nhiệm không dạy tiết 1 sáng thứ 2\" vào danh sách hard constraints.",
    action: "add_constraint",
    actionData: { mo_ta: "GV chủ nhiệm không dạy tiết 1 sáng thứ 2", loai: "hard" },
  },
  {
    keywords: ["tạo lại", "generate", "chạy lại", "regenerate"],
    reply: "Bạn muốn tạo lại toàn bộ TKB? Tôi sẽ áp dụng tất cả ràng buộc hiện tại và tối ưu lại lịch học.",
    action: "regenerate",
  },
  {
    keywords: ["tải", "workload", "tiết", "bao nhiêu"],
    reply: `Tổng quan tải trọng:\n• ${tkbSummaryMock.so_gv} giáo viên đang hoạt động\n• ${tkbSummaryMock.so_phan_cong} phân công chuyên môn\n• Trung bình ~${Math.round(tkbSummaryMock.so_phan_cong / tkbSummaryMock.so_gv)} phân công/GV`,
  },
  {
    keywords: ["cảnh báo", "warning", "vi phạm"],
    reply: `Hiện có ${canhBaoMock.length} cảnh báo trong TKB:\n${canhBaoMock.map((c) => `• [${c.loai.toUpperCase()}] ${c.mo_ta}`).join("\n")}`,
  },
];

function getMockReply(message: string): Omit<ChatMessage, "role"> {
  const lower = message.toLowerCase();
  for (const r of AI_RESPONSES) {
    if (r.keywords.some((k) => lower.includes(k))) {
      return { content: r.reply, action: r.action ?? null, actionData: r.actionData ?? null };
    }
  }
  return {
    content: `Tôi đã nhận được câu hỏi của bạn về TKB. Hiện tại hệ thống có ${tkbSummaryMock.so_lop} lớp, ${tkbSummaryMock.so_gv} giáo viên và ${tkbSummaryMock.so_rang_buoc} ràng buộc đang hoạt động. Bạn cần hỗ trợ gì thêm?`,
    action: null,
  };
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards() {
  const hardCount = rangBuocMock.filter((r) => r.loai === "hard" && r.active).length;
  const softCount = rangBuocMock.filter((r) => r.loai === "soft" && r.active).length;
  const cards = [
    { icon: "group", label: "Giáo viên", value: tkbSummaryMock.so_gv, sub: "đang hoạt động" },
    { icon: "class", label: "Lớp học", value: tkbSummaryMock.so_lop, sub: "khối 6–9" },
    { icon: "rule", label: "Ràng buộc", value: tkbSummaryMock.so_rang_buoc, sub: `${hardCount} hard · ${softCount} soft` },
    { icon: "assignment", label: "Phân công", value: tkbSummaryMock.so_phan_cong, sub: "môn × lớp" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl p-4 flex flex-col gap-1"
          style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>{c.icon}</span>
          <p className="text-2xl font-black" style={{ color: "var(--color-on-surface)" }}>{c.value}</p>
          <p className="text-xs font-bold" style={{ color: "var(--color-on-surface-variant)" }}>{c.label}</p>
          <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Solver Progress ──────────────────────────────────────────────────────────
const SOLVER_STEPS = [
  "Khởi tạo dữ liệu đầu vào...",
  "Áp dụng hard constraints...",
  "Áp dụng soft constraints...",
  "Chạy CP-SAT solver...",
  "Tối ưu hoá lịch học...",
  "Kiểm tra xung đột...",
  "Hoàn thành! Đã tạo TKB.",
];

function SolverProgress({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (step >= SOLVER_STEPS.length) { onDone(); return; }
    const t = setTimeout(() => {
      setLogs((prev) => [...prev, SOLVER_STEPS[step]]);
      setStep((s) => s + 1);
    }, 700);
    return () => clearTimeout(t);
  }, [step, onDone]);

  const progress = Math.round((step / SOLVER_STEPS.length) * 100);
  const done = step >= SOLVER_STEPS.length;

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined ${!done ? "animate-spin" : ""}`}
          style={{ fontSize: 22, color: done ? "#16a34a" : "var(--color-primary)" }}>
          {done ? "check_circle" : "progress_activity"}
        </span>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span style={{ color: "var(--color-on-surface-variant)" }}>
              {done ? "Hoàn thành" : "Đang chạy solver..."}
            </span>
            <span style={{ color: "var(--color-primary)" }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-container-high)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: done ? "#16a34a" : "var(--color-primary)" }} />
          </div>
        </div>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className="flex items-center gap-2 text-xs"
            style={{ color: i === logs.length - 1 && !done ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 14 }}>
              {i < logs.length - 1 || done ? "check" : "arrow_right"}
            </span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TKB Grid (dùng chung cho GV và Lớp) ─────────────────────────────────────
function SlotGrid({ slots, mode, canh_bao }: { slots: TKBSlot[]; mode: "gv" | "lop"; canh_bao: CanhBao[] }) {
  const warnKeys = new Set(canh_bao.flatMap((c) => c.slots.map((s) => `${s.thu}-${s.buoi}-${s.tiet}-${s.ma_gv}`)));
  const hardKeys = new Set(canh_bao.filter((c) => c.loai === "hard").flatMap((c) => c.slots.map((s) => `${s.thu}-${s.buoi}-${s.tiet}-${s.ma_gv}`)));

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 480 }}>
            <thead>
              <tr style={{ background: "var(--color-primary)" }}>
                <th className="p-2 text-left font-bold w-14" style={{ color: "var(--color-on-primary)", borderRight: "1px solid rgba(255,255,255,0.2)" }}>Tiết</th>
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
                <>
                  <tr key={`hdr-${buoi}`}>
                    <td colSpan={7} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                      style={{ background: buoi === "sang" ? "#eff6ff" : "#f0fdf4", color: buoi === "sang" ? "#1d4ed8" : "#15803d" }}>
                      {buoi === "sang" ? "☀ Buổi Sáng" : "🌤 Buổi Chiều"}
                    </td>
                  </tr>
                  {PERIODS.map((tiet) => (
                    <tr key={`${buoi}-${tiet}`} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                      <td className="p-1.5 text-center font-bold"
                        style={{ color: "var(--color-outline)", background: "var(--color-surface-container-low)", borderRight: "1px solid var(--color-outline-variant)" }}>
                        {tiet}
                      </td>
                      {DAYS.map((d, di) => {
                        const slot = slots.find((s) => s.thu === d.thu && s.buoi === buoi && s.tiet === tiet);
                        const key = slot ? `${slot.thu}-${slot.buoi}-${slot.tiet}-${slot.ma_gv}` : "";
                        const isHard = hardKeys.has(key);
                        const isSoft = !isHard && warnKeys.has(key);
                        if (slot) {
                          const c = getColor(slot.mon);
                          return (
                            <td key={d.thu} className="p-1" style={{ borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined }}>
                              <div className="rounded-lg px-1 py-1.5 text-center"
                                style={{ background: c.bg, border: isHard ? "2px solid #ef4444" : isSoft ? "2px solid #f59e0b" : `1px solid ${c.border}` }}>
                                <p className="font-black leading-tight truncate" style={{ color: c.text, fontSize: 9 }}>{slot.mon}</p>
                                <p className="font-bold leading-tight" style={{ color: c.text, fontSize: 10 }}>
                                  {mode === "gv" ? slot.lop : (giaoVienMock.find((g) => g.ma_gv === slot.ma_gv)?.ho_ten ?? slot.ma_gv)}
                                </p>
                                {(isHard || isSoft) && <span style={{ fontSize: 9 }}>{isHard ? "❌" : "⚠️"}</span>}
                              </div>
                            </td>
                          );
                        }
                        return (
                          <td key={d.thu} className="p-1" style={{ borderRight: di < 5 ? "1px solid var(--color-outline-variant)" : undefined }}>
                            <div className="min-h-[38px] rounded-lg" style={{ background: "rgba(0,0,0,0.02)" }} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {canh_bao.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs">
          <span style={{ color: "#ef4444" }}>❌ Hard: {canh_bao.filter((c) => c.loai === "hard").length}</span>
          <span style={{ color: "#f59e0b" }}>⚠️ Soft: {canh_bao.filter((c) => c.loai === "soft").length}</span>
        </div>
      )}
    </div>
  );
}

// ─── TKB Viewer (tab GV / Lớp) ───────────────────────────────────────────────
function TKBViewer({ slots, canh_bao }: { slots: TKBSlot[]; canh_bao: CanhBao[] }) {
  const [tab, setTab] = useState<"gv" | "lop">("gv");
  const [selectedGv, setSelectedGv] = useState("");
  const [selectedLop, setSelectedLop] = useState("");

  const gvList = Array.from(new Set(slots.map((s) => s.ma_gv)));
  const lopList = Array.from(new Set(slots.map((s) => s.lop))).sort();

  const filtered = tab === "gv"
    ? (selectedGv ? slots.filter((s) => s.ma_gv === selectedGv) : [])
    : (selectedLop ? slots.filter((s) => s.lop === selectedLop) : []);

  const gvInfo = selectedGv ? giaoVienMock.find((g) => g.ma_gv === selectedGv) : null;

  return (
    <div className="space-y-3">
      {/* Tab toggle */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "var(--color-surface-container)" }}>
        {(["gv", "lop"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSelectedGv(""); setSelectedLop(""); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t ? "var(--color-primary)" : "transparent",
              color: tab === t ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{t === "gv" ? "person" : "class"}</span>
            {t === "gv" ? "Theo giáo viên" : "Theo lớp"}
          </button>
        ))}
      </div>

      {/* Selector */}
      {tab === "gv" ? (
        <div className="space-y-2">
          <select className="w-full px-3 py-2 rounded-xl text-sm border-none outline-none"
            style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
            value={selectedGv} onChange={(e) => setSelectedGv(e.target.value)}>
            <option value="">-- Chọn giáo viên --</option>
            {gvList.map((ma) => {
              const gv = giaoVienMock.find((g) => g.ma_gv === ma);
              return <option key={ma} value={ma}>{gv ? `${gv.ho_ten} (${ma})` : ma}</option>;
            })}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {gvList.map((ma) => {
              const gv = giaoVienMock.find((g) => g.ma_gv === ma);
              return (
                <button key={ma} onClick={() => setSelectedGv(ma)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: selectedGv === ma ? "var(--color-primary)" : "var(--color-surface-container)",
                    color: selectedGv === ma ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                  }}>
                  {gv?.ho_ten.split(" ").pop() ?? ma}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <select className="w-full px-3 py-2 rounded-xl text-sm border-none outline-none"
            style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
            value={selectedLop} onChange={(e) => setSelectedLop(e.target.value)}>
            <option value="">-- Chọn lớp --</option>
            {lopList.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="flex flex-wrap gap-1.5">
            {lopList.map((l) => (
              <button key={l} onClick={() => setSelectedLop(l)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: selectedLop === l ? "var(--color-primary)" : "var(--color-surface-container)",
                  color: selectedLop === l ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info bar */}
      {tab === "gv" && gvInfo && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
          style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
          <span className="font-bold">{gvInfo.ho_ten}</span>
          <span className="opacity-70">· {gvInfo.to_chuyen_mon}</span>
          {gvInfo.chuc_vu && <span className="opacity-70">· {gvInfo.chuc_vu}</span>}
          <span className="ml-auto font-bold">{filtered.length} tiết/tuần</span>
        </div>
      )}
      {tab === "lop" && selectedLop && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
          style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>class</span>
          <span className="font-bold">Lớp {selectedLop}</span>
          <span className="ml-auto font-bold">{filtered.length} tiết/tuần</span>
        </div>
      )}

      {/* Grid or empty state */}
      {filtered.length > 0 ? (
        <SlotGrid slots={filtered} mode={tab} canh_bao={canh_bao} />
      ) : (
        <div className="py-8 text-center rounded-xl" style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
          <span className="material-symbols-outlined mb-2" style={{ fontSize: 32 }}>
            {tab === "gv" ? "person_search" : "class"}
          </span>
          <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>
            {tab === "gv" ? "Chọn giáo viên để xem lịch dạy" : "Chọn lớp để xem thời khoá biểu"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── AI ChatBox ───────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "TKB hiện tại có lỗi gì không?",
  "Tổng tải trọng giáo viên?",
  "Thêm ràng buộc: không dạy tiết 1 thứ 2",
  "Tạo lại TKB",
];

function ChatBox({ onAddConstraint, onRegenerate }: {
  onAddConstraint: (data: { mo_ta: string; loai: "hard" | "soft" }) => void;
  onRegenerate: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Xin chào! Tôi là trợ lý AI của hệ thống TKB.\n\nHiện tại có ${tkbSummaryMock.so_gv} GV, ${tkbSummaryMock.so_lop} lớp, ${tkbSummaryMock.so_rang_buoc} ràng buộc.\n\nBạn có thể hỏi tôi về TKB, thêm ràng buộc, hoặc yêu cầu tạo lại lịch.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const reply = getMockReply(msg);
    setMessages((prev) => [...prev, { role: "assistant", ...reply }]);
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
        style={{ background: "var(--color-primary)", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "white" }}>smart_toy</span>
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "white" }}>Trợ lý AI TKB</p>
          <p className="text-[10px] opacity-75" style={{ color: "white" }}>Gemini 2.0 Flash</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--color-primary-container)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--color-on-primary-container)" }}>smart_toy</span>
              </div>
            )}
            <div className={`max-w-[85%] space-y-2`}>
              <div className="px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  background: msg.role === "user" ? "var(--color-primary)" : "var(--color-surface-container-high)",
                  color: msg.role === "user" ? "var(--color-on-primary)" : "var(--color-on-surface)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}>
                {msg.content}
              </div>

              {/* Action buttons */}
              {msg.action === "add_constraint" && msg.actionData && (
                <button
                  onClick={() => { onAddConstraint(msg.actionData!); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add_circle</span>
                  Thêm ràng buộc này
                </button>
              )}
              {msg.action === "regenerate" && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: "var(--color-tertiary-container)", color: "var(--color-on-tertiary-container)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
                  Tạo lại TKB
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--color-primary-container)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--color-on-primary-container)" }}>smart_toy</span>
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
              style={{ background: "var(--color-surface-container-high)", borderRadius: "18px 18px 18px 4px" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: "var(--color-outline)", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0"
        style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => sendMessage(s)}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap flex-shrink-0 transition-all hover:opacity-80"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)", border: "1px solid var(--color-outline-variant)" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 flex-shrink-0"
        style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
        <input
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border-none outline-none"
          style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
          placeholder="Hỏi về TKB, thêm ràng buộc..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TaoTkbPage() {
  const [hasTKB, setHasTKB] = useState(false);
  const [solving, setSolving] = useState(false);
  const [canh_bao, setCanhBao] = useState<CanhBao[]>([]);
  const [slots, setSlots] = useState<TKBSlot[]>([]);
  const [constraints, setConstraints] = useState(rangBuocMock);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleGenerate() {
    setSolving(true);
    setHasTKB(false);
  }

  function handleSolverDone() {
    setSolving(false);
    setHasTKB(true);
    setSlots(tkbMock);
    setCanhBao(canhBaoMock);
    showToast("Tạo TKB thành công!");
  }

  function handleAddConstraint(data: { mo_ta: string; loai: "hard" | "soft" }) {
    const newC = { id: Date.now(), mo_ta: data.mo_ta, loai: data.loai, rule_ky_thuat: "{}", active: true };
    setConstraints((prev) => [...prev, newC]);
    showToast(`Đã thêm ràng buộc: "${data.mo_ta}"`);
  }

  function handleRegenerate() {
    setHasTKB(false);
    setSolving(true);
  }

  // Phân công table
  const gvGroups = giaoVienMock.map((gv) => ({
    gv,
    pcs: phanCongMock.filter((pc) => pc.ma_gv === gv.ma_gv),
    total: phanCongMock.filter((pc) => pc.ma_gv === gv.ma_gv).reduce((s, pc) => s + pc.so_tiet_tuan, 0),
  })).filter((g) => g.pcs.length > 0);

  return (
    <div className="h-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2"
          style={{ background: "#16a34a", color: "white" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 h-full" style={{ minHeight: "calc(100vh - 120px)" }}>
        {/* ── LEFT PANEL ── */}
        <div className="flex-1 min-w-0 space-y-5 overflow-y-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
              Tạo thời khoá biểu
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
              Cấu hình dữ liệu và chạy AI solver để sinh phương án tối ưu
            </p>
          </div>

          {/* Summary */}
          <SummaryCards />

          {/* Phân công collapsible */}
          <details className="rounded-2xl overflow-hidden group"
            style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
            <summary className="px-5 py-4 flex items-center gap-2 cursor-pointer select-none list-none"
              style={{ color: "var(--color-on-surface)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>assignment</span>
              <span className="font-bold text-sm flex-1">Bảng phân công chuyên môn</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                {phanCongMock.length} phân công
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>expand_more</span>
            </summary>
            <div className="overflow-x-auto border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--color-surface-container-low)" }}>
                    {["Giáo viên", "Lớp", "Môn", "Tiết/tuần"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-outline)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gvGroups.map(({ gv, pcs, total }) =>
                    pcs.map((pc, idx) => {
                      const overload = total > gv.so_tiet_chuan + 2 || total < gv.so_tiet_chuan - 2;
                      return (
                        <tr key={pc.id} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                          {idx === 0 && (
                            <td rowSpan={pcs.length} className="px-4 py-2 font-semibold"
                              style={{ color: "var(--color-on-surface)", verticalAlign: "top", paddingTop: 10 }}>
                              <div>{gv.ho_ten}</div>
                              <div className="text-[10px] font-bold mt-0.5"
                                style={{ color: overload ? "#ef4444" : "#16a34a" }}>
                                {total}t / {gv.so_tiet_chuan}t chuẩn
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-2" style={{ color: "var(--color-on-surface-variant)" }}>{pc.lop}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: getColor(pc.mon).bg, color: getColor(pc.mon).text }}>
                              {pc.mon}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-bold" style={{ color: "var(--color-primary)" }}>{pc.so_tiet_tuan}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </details>

          {/* Ràng buộc active */}
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>rule</span>
              <span className="font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>Ràng buộc đang áp dụng</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                {constraints.filter((c) => c.loai === "hard" && c.active).length} hard
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "#fef9c3", color: "#713f12" }}>
                {constraints.filter((c) => c.loai === "soft" && c.active).length} soft
              </span>
            </div>
            {constraints.filter((c) => c.active).map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs py-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase"
                  style={{ background: c.loai === "hard" ? "#fee2e2" : "#fef9c3", color: c.loai === "hard" ? "#991b1b" : "#713f12" }}>
                  {c.loai}
                </span>
                <span style={{ color: "var(--color-on-surface-variant)" }}>{c.mo_ta}</span>
              </div>
            ))}
          </div>

          {/* Generate button */}
          {!solving && !hasTKB && (
            <button onClick={handleGenerate}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:scale-[1.01] shadow-lg"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>smart_toy</span>
              Tạo thời khoá biểu tự động
            </button>
          )}

          {/* Solver progress */}
          {solving && <SolverProgress onDone={handleSolverDone} />}

          {/* TKB Grid after generation */}
          {hasTKB && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#16a34a" }}>check_circle</span>
                <span className="font-bold" style={{ color: "var(--color-on-surface)" }}>TKB đã được tạo</span>
                <button onClick={handleGenerate}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
                  Tạo lại
                </button>
              </div>
              <TKBViewer slots={slots} canh_bao={canh_bao} />
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — ChatBox ── */}
        <div className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0" style={{ minHeight: 500 }}>
          <div className="sticky top-4" style={{ height: "calc(100vh - 140px)", minHeight: 500 }}>
            <ChatBox onAddConstraint={handleAddConstraint} onRegenerate={handleRegenerate} />
          </div>
        </div>
      </div>
    </div>
  );
}
