"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  createGiaoVienBulk,
  createPhanCongBulk,
  getGiaoVienList,
  getDinhMucList,
  getDanhSachMon,
  getPhanCongList,
  updateDinhMucBulk,
  createRangBuoc,
  truncateAllData,
} from "@/lib/api";
import type { GiaoVien, PhanCong, DinhMuc } from "@/lib/types";
import { store } from "@/lib/data-store";

type Step = 1 | 2 | 3 | 4;
const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Giáo viên" },
  { id: 2, label: "Phân công" },
  { id: 3, label: "Định mức" },
  { id: 4, label: "Ràng buộc" },
];

type GvRow = { ma_gv?: string; ho_ten: string; to_chuyen_mon?: string; chuc_vu?: string; lop_chu_nhiem?: string };
type PcRow = { ma_gv: string; lop: string; mon: string; so_tiet_tuan: number };
type DmRow = { khoi: string; mon: string; so_tiet_tuan: number; gioi_han_buoi?: number };

function parsePasteGv(text: string): GvRow[] {
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((r) => r.split(/\t/).map((c) => c.trim()));
  const data: GvRow[] = [];
  const isHeader = (r: string[]) =>
    r.some((c) => /^(mã|ma|họ|ho|tên|ten|tổ|to)\s/i.test(c) || /stt|tt$/i.test(c));
  for (const row of rows) {
    if (row.length < 1 || !row[0]) continue;
    if (isHeader(row)) continue;
    const isCode = (s: string) => /^[a-z0-9]{2,15}$/i.test(s) || /^GV\d+/i.test(s);
    const hasMaGv = row.length >= 5 && row[0] && isCode(row[0]);
    const ho_ten = hasMaGv ? row[1] : row[0];
    if (!ho_ten) continue;
    data.push({
      ma_gv: hasMaGv ? row[0] : undefined,
      ho_ten,
      to_chuyen_mon: hasMaGv ? row[2] : row[1] || undefined,
      chuc_vu: hasMaGv ? row[3] : row[2] || undefined,
      lop_chu_nhiem: hasMaGv ? row[4] : row[3] || undefined,
    });
  }
  return data;
}

function parsePastePc(text: string): PcRow[] {
  const rows = text.trim().split(/\r?\n/).map((r) => r.split(/\t/).map((c) => c.trim()));
  const data: PcRow[] = [];
  for (const row of rows) {
    if (row.length < 4) continue;
    const so = parseInt(row[3], 10);
    if (isNaN(so) || so < 1) continue;
    data.push({ ma_gv: row[0], lop: row[1], mon: row[2], so_tiet_tuan: so });
  }
  return data;
}

function parsePasteDm(text: string): DmRow[] {
  const rows = text.trim().split(/\r?\n/).map((r) => r.split(/\t/).map((c) => c.trim()));
  const data: DmRow[] = [];
  for (const row of rows) {
    if (row.length < 3) continue;
    const so = parseInt(row[2], 10);
    data.push({
      khoi: row[0],
      mon: row[1],
      so_tiet_tuan: isNaN(so) ? 0 : so,
      gioi_han_buoi: row[3] ? parseInt(row[3], 10) : undefined,
    });
  }
  return data;
}

const MON_GVCN = ["Chào cờ", "Sinh hoạt lớp"] as const;

// ─── Danger Zone component ────────────────────────────────────────────────────

function DangerZone({ onTruncate, onReset, saving }: { onTruncate: () => void; onReset: () => void; saving: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const PHRASE = "XOA";

  function handleSubmit() {
    if (confirmText.trim().toUpperCase() !== PHRASE) return;
    setConfirmText("");
    setOpen(false);
    onTruncate();
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-error)", background: "var(--color-surface-container-lowest)" }}
    >
      <button
        onClick={() => { setOpen((o) => !o); setConfirmText(""); }}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
        style={{ color: "var(--color-error)" }}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
          <span className="font-headline font-bold text-sm">Danger Zone — Xóa toàn bộ dữ liệu</span>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--color-error)" }}>

          {/* Reset về demo */}
          <div className="mt-4 mb-5 p-4 rounded-xl flex items-center justify-between gap-4"
            style={{ background: "var(--color-surface-container)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>
                Khôi phục dữ liệu demo
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
                Reset toàn bộ về dữ liệu mẫu gốc (24 GV, 24 lớp, TKB đầy đủ).
              </p>
            </div>
            <button
              onClick={onReset}
              disabled={saving}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}
            >
              Khôi phục demo
            </button>
          </div>

          {/* Xóa hết */}
          <p className="text-sm mb-3" style={{ color: "var(--color-on-surface-variant)" }}>
            Xóa toàn bộ giáo viên, phân công, định mức, ràng buộc và TKB khỏi bộ nhớ.
            <strong style={{ color: "var(--color-error)" }}> Không thể hoàn tác.</strong>
          </p>
          <p className="text-xs mb-2 font-semibold" style={{ color: "var(--color-on-surface)" }}>
            Gõ <code className="px-1.5 py-0.5 rounded font-mono" style={{ background: "#fee2e2", color: "#991b1b" }}>XOA</code> để xác nhận:
          </p>
          <div className="flex gap-2">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Nhập XOA"
              className="px-3 py-2 rounded-lg text-sm border w-40 font-mono"
              style={{
                borderColor: confirmText.trim().toUpperCase() === PHRASE ? "#991b1b" : "var(--color-outline-variant)",
                background: "var(--color-surface-container-lowest)",
                color: "var(--color-on-surface)",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={saving || confirmText.trim().toUpperCase() !== PHRASE}
              className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
              style={{ background: "var(--color-error)", color: "white" }}
            >
              Xóa hết dữ liệu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const RANG_BUOC_PRESETS = [
  { mo_ta: "Không dạy quá 5 tiết/ngày", loai: "hard" as const },
  { mo_ta: "Không dạy quá 4 tiết liên tiếp", loai: "hard" as const },
  { mo_ta: "Ưu tiên môn chính buổi sáng", loai: "soft" as const },
];

export default function ImportPage() {
  const [step, setStep] = useState<Step>(1);
  const [giaoVien, setGiaoVien] = useState<GiaoVien[]>([]);
  const [phanCong, setPhanCong] = useState<PhanCong[]>([]);
  const [dinhMuc, setDinhMuc] = useState<DinhMuc[]>([]);
  const [danhSachMon, setDanhSachMon] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [gvRows, setGvRows] = useState<GvRow[]>([]);
  const [gvRowsPrev, setGvRowsPrev] = useState<GvRow[] | null>(null);
  const [gvPaste, setGvPaste] = useState("");
  const [pcRows, setPcRows] = useState<PcRow[]>([]);
  const [pcRowsPrev, setPcRowsPrev] = useState<PcRow[] | null>(null);
  const [pcPaste, setPcPaste] = useState("");
  const [dmRows, setDmRows] = useState<DmRow[]>([]);
  const [dmRowsPrev, setDmRowsPrev] = useState<DmRow[] | null>(null);
  const [dmPaste, setDmPaste] = useState("");

  const [aiLog, setAiLog] = useState<{ text: string; done: boolean }[]>([]);
  const [aiRunning, setAiRunning] = useState<"gv" | "pc" | "dm" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<"gv" | "pc" | "dm" | null>(null);

  function openFilePicker(type: "gv" | "pc" | "dm") {
    pendingTypeRef.current = type;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !pendingTypeRef.current) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const tsv = XLSX.utils.sheet_to_csv(ws, { FS: "\t" });
      const type = pendingTypeRef.current;
      if (type === "gv") setGvPaste(tsv);
      else if (type === "pc") setPcPaste(tsv);
      else setDmPaste(tsv);
    } catch {
      alert("Không đọc được file. Vui lòng dùng file .xlsx hoặc .csv.");
    }
    pendingTypeRef.current = null;
  }

  async function runAiParse(
    type: "gv" | "pc" | "dm",
    pasteText: string,
    steps: string[],
    applyFn: () => void
  ) {
    if (!pasteText.trim() || aiRunning) return;
    setAiRunning(type);
    setAiLog([]);
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 0 : 650));
      setAiLog((prev) => [
        ...prev.map((l) => ({ ...l, done: true })),
        { text: steps[i], done: false },
      ]);
    }
    await new Promise((r) => setTimeout(r, 500));
    applyFn();
    setAiRunning(null);
    setAiLog([]);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [gv, pc, dm, mon] = await Promise.all([
        getGiaoVienList(),
        getPhanCongList(),
        getDinhMucList(),
        getDanhSachMon(),
      ]);
      setGiaoVien(gv);
      setPhanCong(pc);
      setDinhMuc(dm);
      setDanhSachMon(mon ?? []);
    } catch {
      setGiaoVien([]);
      setPhanCong([]);
      setDinhMuc([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const gvToListForForm = useMemo(() => {
    const fromGv = new Set(giaoVien.map((g) => g.to_chuyen_mon).filter(Boolean));
    return Array.from(fromGv).sort((a, b) => (a ?? "").localeCompare(b ?? "", "vi"));
  }, [giaoVien]);

  /** Gợi ý môn khi nhập phân công: toàn bộ môn trong Định mức + CC/SHL (BE kiểm tra GVCN khi lưu). */
  const pcMonSuggestList = useMemo(() => {
    const s = new Set(danhSachMon);
    for (const x of MON_GVCN) s.add(x);
    return Array.from(s).sort((a, b) => a.localeCompare(b, "vi"));
  }, [danhSachMon]);

  const applyGvPaste = () => {
    const parsed = parsePasteGv(gvPaste);
    if (parsed.length) {
      setGvRowsPrev(gvRows);
      setGvRows((prev) => [...prev, ...parsed]);
      setGvPaste("");
    }
  };
  const undoGvPaste = () => {
    if (gvRowsPrev !== null) {
      setGvRows(gvRowsPrev);
      setGvRowsPrev(null);
      setGvPaste("");
    }
  };

  const applyPcPaste = () => {
    const parsed = parsePastePc(pcPaste);
    if (parsed.length) {
      setPcRowsPrev(pcRows);
      setPcRows((prev) => [...prev, ...parsed]);
      setPcPaste("");
    }
  };
  const undoPcPaste = () => {
    if (pcRowsPrev !== null) {
      setPcRows(pcRowsPrev);
      setPcRowsPrev(null);
      setPcPaste("");
    }
  };

  const applyDmPaste = () => {
    const parsed = parsePasteDm(dmPaste);
    if (parsed.length) {
      setDmRowsPrev(dmRows);
      setDmRows((prev) => [...prev, ...parsed]);
      setDmPaste("");
    }
  };
  const undoDmPaste = () => {
    if (dmRowsPrev !== null) {
      setDmRows(dmRowsPrev);
      setDmRowsPrev(null);
      setDmPaste("");
    }
  };

  const saveGv = async () => {
    const valid = gvRows.filter((r) => r.ho_ten?.trim());
    if (!valid.length) {
      setMessage("Chưa có dữ liệu giáo viên hợp lệ.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const created = await createGiaoVienBulk(
        valid.map((r) => ({
          ma_gv: r.ma_gv || undefined,
          ho_ten: r.ho_ten,
          to_chuyen_mon: r.to_chuyen_mon || undefined,
          chuc_vu: r.chuc_vu || undefined,
          lop_chu_nhiem: r.lop_chu_nhiem || undefined,
        }))
      );
      setMessage(`Đã thêm ${created.length} giáo viên.`);
      setGvRows([]);
      setGvRowsPrev(null);
      await loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu giáo viên");
    } finally {
      setSaving(false);
    }
  };

  const savePc = async () => {
    const valid = pcRows.filter((r) => r.ma_gv && r.lop && r.mon && r.so_tiet_tuan > 0);
    if (!valid.length) {
      setMessage("Chưa có phân công hợp lệ.");
      return;
    }
    const known = new Set(giaoVien.map((g) => g.ma_gv));
    const ok = valid.filter((r) => known.has(r.ma_gv));
    if (ok.length < valid.length) {
      setMessage(`Bỏ qua ${valid.length - ok.length} dòng (mã GV không tồn tại).`);
    }
    if (!ok.length) return;
    setSaving(true);
    setMessage("");
    try {
      const created = await createPhanCongBulk(ok);
      setMessage(`Đã thêm ${created.length} phân công.`);
      setPcRows([]);
      setPcRowsPrev(null);
      await loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu phân công");
    } finally {
      setSaving(false);
    }
  };

  const saveDm = async () => {
    const valid = dmRows.filter((r) => r.khoi && r.mon);
    if (!valid.length) {
      setMessage("Chưa có định mức hợp lệ.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = valid.map((r) => ({
        khoi: r.khoi,
        mon: r.mon,
        so_tiet_tuan: r.so_tiet_tuan || 0,
        gioi_han_buoi: r.gioi_han_buoi ?? 2,
      }));
      await updateDinhMucBulk(payload);
      setMessage(`Đã cập nhật ${valid.length} định mức.`);
      setDmRows([]);
      setDmRowsPrev(null);
      await loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu định mức");
    } finally {
      setSaving(false);
    }
  };

  const addRangBuoc = async (mo_ta: string, loai: "hard" | "soft") => {
    setSaving(true);
    setMessage("");
    try {
      await createRangBuoc({ mo_ta, loai });
      setMessage("Đã thêm ràng buộc.");
      await loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi thêm ràng buộc");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Khôi phục về dữ liệu demo gốc? Mọi thay đổi sẽ bị mất.")) return;
    setSaving(true);
    setMessage("");
    try {
      store.resetToMock();
      setMessage("Đã khôi phục dữ liệu demo.");
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleTruncate = async () => {
    if (!confirm("Xóa toàn bộ dữ liệu? Không thể hoàn tác.")) return;
    setSaving(true);
    setMessage("");
    try {
      await truncateAllData();
      setMessage("Đã xóa toàn bộ dữ liệu.");
      setGvRows([]);
      setPcRows([]);
      setDmRows([]);
      await loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi xóa");
    } finally {
      setSaving(false);
    }
  };

  const ExcelBtn = ({ forType }: { forType: "gv" | "pc" | "dm" }) => (
    <button
      onClick={() => openFilePicker(forType)}
      disabled={!!aiRunning}
      className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-1.5"
      style={{ background: "#16a34a", color: "white" }}
      title="Chọn file Excel (.xlsx) hoặc CSV"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload_file</span>
      Import Excel
    </button>
  );

  const AiLogPanel = ({ forType }: { forType: "gv" | "pc" | "dm" }) =>
    aiRunning === forType && aiLog.length > 0 ? (
      <div
        className="rounded-xl px-4 py-3 text-xs space-y-1 mb-3"
        style={{ background: "#f0f4ff", border: "1px solid #c7d2fe" }}
      >
        {aiLog.map((l, i) => (
          <div key={i} className="flex items-center gap-2" style={{ color: l.done ? "#6b7280" : "#3730a3" }}>
            {l.done ? (
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#22c55e" }}>check_circle</span>
            ) : (
              <span className="animate-spin inline-block w-3 h-3 rounded-full border-2" style={{ borderColor: "#818cf8 transparent #818cf8 transparent" }} />
            )}
            <span className={l.done ? "" : "font-semibold"}>{l.text}</span>
          </div>
        ))}
      </div>
    ) : null;

  const AiBtn = ({
    forType,
    pasteText,
    steps,
    applyFn,
  }: {
    forType: "gv" | "pc" | "dm";
    pasteText: string;
    steps: string[];
    applyFn: () => void;
  }) => (
    <button
      onClick={() => runAiParse(forType, pasteText, steps, applyFn)}
      disabled={!pasteText.trim() || !!aiRunning}
      className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 inline-flex items-center gap-1.5"
      style={{ background: "#6366f1", color: "white" }}
      title="AI tự đọc và phân tích dữ liệu"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
      AI Parse
    </button>
  );

  const card = "rounded-2xl p-5";
  const cardBg = { background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" };
  const inputCls =
    "px-3 py-2 rounded-lg text-sm w-full border";
  const inputStyle = {
    borderColor: "var(--color-outline-variant)",
    background: "var(--color-surface-container-lowest)",
    color: "var(--color-on-surface)",
  };
  const btnPrimary =
    "px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-2";
  const btnPrimaryStyle = { background: "var(--color-primary)", color: "var(--color-on-primary)" };

  if (loading && giaoVien.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl p-8 text-center" style={cardBg}>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">
      {/* Hidden file input for Excel import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div>
        <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
          Nhập dữ liệu
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Import file Excel / CSV hoặc dán từ Excel (Ctrl+V). Thứ tự: Giáo viên → Phân công → Định mức → Ràng buộc.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              step === s.id ? "" : "opacity-70 hover:opacity-100"
            }`}
            style={
              step === s.id
                ? { background: "var(--color-primary)", color: "var(--color-on-primary)" }
                : { background: "var(--color-surface-container)", color: "var(--color-on-surface)" }
            }
          >
            {s.id}. {s.label}
          </button>
        ))}
      </div>

      {/* Step 1: Giáo viên */}
      {step === 1 && (
        <div className={card} style={cardBg}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>person_add</span>
            <h2 className="font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
              Giáo viên ({giaoVien.length} trong hệ thống)
            </h2>
          </div>
          <p className="text-xs mb-2" style={{ color: "var(--color-outline)" }}>
            Thứ tự cột: <strong>Mã GV (tùy chọn) | Họ tên | Tổ / bộ môn | Chức vụ | Lớp CN</strong>. Dòng 1 có thể là tiêu đề.
          </p>
          <div className="flex gap-2 mb-2">
            <ExcelBtn forType="gv" />
          </div>
          <div className="flex gap-2 mb-2">
            <textarea
              value={gvPaste}
              onChange={(e) => setGvPaste(e.target.value)}
              placeholder="Dán dữ liệu từ Excel (Ctrl+V)..."
              rows={3}
              className={inputCls}
              style={inputStyle}
            />
            <div className="flex flex-col gap-2">
              <AiBtn
                forType="gv"
                pasteText={gvPaste}
                applyFn={applyGvPaste}
                steps={[
                  "Đang đọc nội dung dán...",
                  `Phát hiện ${parsePasteGv(gvPaste).length} dòng dữ liệu`,
                  "Nhận diện cột: Mã GV, Họ tên, Tổ/Bộ môn, Chức vụ",
                  "Chuẩn hoá tên tiếng Việt...",
                  `✅ Hoàn tất — thêm ${parsePasteGv(gvPaste).length} giáo viên`,
                ]}
              />
              <button onClick={applyGvPaste} disabled={!gvPaste.trim()} className={btnPrimary} style={btnPrimaryStyle}>
                Thêm
              </button>
              <button
                onClick={undoGvPaste}
                disabled={gvRowsPrev === null}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                title="Hoàn tác lần dán trước (dán nhầm có thể dán lại)"
              >
                Hoàn tác
              </button>
            </div>
          </div>
          <AiLogPanel forType="gv" />
          <button
            onClick={() => setGvRows((p) => [...p, { ho_ten: "" }])}
            className="text-sm mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            + Thêm dòng thủ công
          </button>
          {gvRows.length > 0 && (
            <div className="overflow-x-auto mb-3">
              <datalist id="import-gv-to-bm">
                {gvToListForForm.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--color-surface-container)" }}>
                    <th className="text-left py-2 px-2">Mã GV</th>
                    <th className="text-left py-2 px-2">Họ tên *</th>
                    <th className="text-left py-2 px-2">Tổ / bộ môn</th>
                    <th className="text-left py-2 px-2">Chức vụ</th>
                    <th className="text-left py-2 px-2">Lớp CN</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {gvRows.map((r, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
                      <td className="py-1 px-2">
                        <input
                          value={r.ma_gv ?? ""}
                          onChange={(e) =>
                            setGvRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], ma_gv: e.target.value || undefined };
                              return n;
                            })
                          }
                          placeholder="Tự sinh"
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 80 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.ho_ten}
                          onChange={(e) =>
                            setGvRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], ho_ten: e.target.value };
                              return n;
                            })
                          }
                          placeholder="Bắt buộc"
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 120 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.to_chuyen_mon ?? ""}
                          onChange={(e) =>
                            setGvRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], to_chuyen_mon: e.target.value || undefined };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 100 }}
                          placeholder="Nhập tay"
                          list="import-gv-to-bm"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.chuc_vu ?? ""}
                          onChange={(e) =>
                            setGvRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], chuc_vu: e.target.value || undefined };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 70 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.lop_chu_nhiem ?? ""}
                          onChange={(e) =>
                            setGvRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], lop_chu_nhiem: e.target.value || undefined };
                              return n;
                            })
                          }
                          placeholder="6/1"
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 60 }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => setGvRows((p) => p.filter((_, j) => j !== i))}
                          className="text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={saveGv} disabled={saving || gvRows.length === 0} className={btnPrimary} style={btnPrimaryStyle}>
            {saving ? "Đang lưu..." : `Lưu ${gvRows.length} giáo viên`}
          </button>
        </div>
      )}

      {/* Step 2: Phân công */}
      {step === 2 && (
        <div className={card} style={cardBg}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>assignment</span>
            <h2 className="font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
              Phân công dạy ({phanCong.length} trong hệ thống)
            </h2>
          </div>
          <p className="text-xs mb-2" style={{ color: "var(--color-outline)" }}>
            Thứ tự cột: <strong>Mã GV | Lớp | Môn | Số tiết/tuần</strong>. Mã GV phải tồn tại trong bước 1.
          </p>
          <div className="flex gap-2 mb-2">
            <ExcelBtn forType="pc" />
          </div>
          <div className="flex gap-2 mb-2">
            <textarea
              value={pcPaste}
              onChange={(e) => setPcPaste(e.target.value)}
              placeholder="Dán: Mã GV	Lớp	Môn	Số tiết..."
              rows={3}
              className={inputCls}
              style={inputStyle}
            />
            <div className="flex flex-col gap-2">
              <AiBtn
                forType="pc"
                pasteText={pcPaste}
                applyFn={applyPcPaste}
                steps={[
                  "Đang đọc nội dung dán...",
                  `Phát hiện ${parsePastePc(pcPaste).length} dòng phân công`,
                  "Đối chiếu mã giáo viên trong hệ thống...",
                  "Nhận diện tên môn học...",
                  `✅ Hoàn tất — ${parsePastePc(pcPaste).length} phân công hợp lệ`,
                ]}
              />
              <button onClick={applyPcPaste} disabled={!pcPaste.trim()} className={btnPrimary} style={btnPrimaryStyle}>
                Thêm
              </button>
              <button
                onClick={undoPcPaste}
                disabled={pcRowsPrev === null}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                title="Hoàn tác lần dán trước"
              >
                Hoàn tác
              </button>
            </div>
          </div>
          <AiLogPanel forType="pc" />
          <button
            onClick={() => setPcRows((p) => [...p, { ma_gv: giaoVien[0]?.ma_gv ?? "", lop: "", mon: "", so_tiet_tuan: 4 }])}
            className="text-sm mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            + Thêm dòng
          </button>
          {pcRows.length > 0 && (
            <div className="overflow-x-auto mb-3">
              <datalist id="import-pc-mon-suggest">
                {pcMonSuggestList.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--color-surface-container)" }}>
                    <th className="text-left py-2 px-2">Mã GV</th>
                    <th className="text-left py-2 px-2">Lớp</th>
                    <th className="text-left py-2 px-2">Môn</th>
                    <th className="text-left py-2 px-2">Tiết/tuần</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {pcRows.map((r, i) => {
                    return (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
                      <td className="py-1 px-2">
                        <select
                          value={r.ma_gv}
                          onChange={(e) =>
                            setPcRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], ma_gv: e.target.value, mon: "" };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 100 }}
                        >
                          <option value="">-- Chọn GV --</option>
                          {giaoVien.map((g) => (
                            <option key={g.ma_gv} value={g.ma_gv}>
                              {g.ma_gv} - {g.ho_ten}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.lop}
                          onChange={(e) =>
                            setPcRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], lop: e.target.value };
                              return n;
                            })
                          }
                          placeholder="6/1"
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 60 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.mon}
                          onChange={(e) =>
                            setPcRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], mon: e.target.value };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 100 }}
                          placeholder="Tên môn"
                          list="import-pc-mon-suggest"
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          min={1}
                          value={r.so_tiet_tuan}
                          onChange={(e) =>
                            setPcRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], so_tiet_tuan: parseInt(e.target.value, 10) || 0 };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 70 }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => setPcRows((p) => p.filter((_, j) => j !== i))}
                          className="text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={savePc} disabled={saving || pcRows.length === 0} className={btnPrimary} style={btnPrimaryStyle}>
            {saving ? "Đang lưu..." : `Lưu ${pcRows.length} phân công`}
          </button>
        </div>
      )}

      {/* Step 3: Định mức */}
      {step === 3 && (
        <div className={card} style={cardBg}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>tune</span>
            <h2 className="font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
              Định mức môn theo khối ({dinhMuc.length} trong hệ thống)
            </h2>
          </div>
          <p className="text-xs mb-2" style={{ color: "var(--color-outline)" }}>
            Thứ tự cột: <strong>Khối | Môn | Số tiết/tuần | GH buổi (tùy chọn)</strong>
          </p>
          <div className="flex gap-2 mb-2">
            <ExcelBtn forType="dm" />
          </div>
          <div className="flex gap-2 mb-2">
            <textarea
              value={dmPaste}
              onChange={(e) => setDmPaste(e.target.value)}
              placeholder="Dán: Khối 6	Toán	4	2..."
              rows={3}
              className={inputCls}
              style={inputStyle}
            />
            <div className="flex flex-col gap-2">
              <AiBtn
                forType="dm"
                pasteText={dmPaste}
                applyFn={applyDmPaste}
                steps={[
                  "Đang đọc nội dung dán...",
                  `Nhận diện ${parsePasteDm(dmPaste).length} định mức`,
                  "Phân tích khối lớp và tên môn...",
                  "Kiểm tra giới hạn buổi hợp lệ...",
                  `✅ Hoàn tất — ${parsePasteDm(dmPaste).length} định mức sẵn sàng`,
                ]}
              />
              <button onClick={applyDmPaste} disabled={!dmPaste.trim()} className={btnPrimary} style={btnPrimaryStyle}>
                Thêm
              </button>
              <button
                onClick={undoDmPaste}
                disabled={dmRowsPrev === null}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
                title="Hoàn tác lần dán trước"
              >
                Hoàn tác
              </button>
            </div>
          </div>
          <AiLogPanel forType="dm" />
          <button
            onClick={() => setDmRows((p) => [...p, { khoi: "Khối 6", mon: "", so_tiet_tuan: 4, gioi_han_buoi: 2 }])}
            className="text-sm mb-3"
            style={{ color: "var(--color-primary)" }}
          >
            + Thêm dòng
          </button>
          {dmRows.length > 0 && (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--color-surface-container)" }}>
                    <th className="text-left py-2 px-2">Khối</th>
                    <th className="text-left py-2 px-2">Môn</th>
                    <th className="text-left py-2 px-2">Tiết/tuần</th>
                    <th className="text-left py-2 px-2">GH buổi</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {dmRows.map((r, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
                      <td className="py-1 px-2">
                        <input
                          value={r.khoi}
                          onChange={(e) =>
                            setDmRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], khoi: e.target.value };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 80 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          value={r.mon}
                          onChange={(e) =>
                            setDmRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], mon: e.target.value };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 80 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          min={0}
                          value={r.so_tiet_tuan}
                          onChange={(e) =>
                            setDmRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], so_tiet_tuan: parseInt(e.target.value, 10) || 0 };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 70 }}
                        />
                      </td>
                      <td className="py-1 px-2">
                        <input
                          type="number"
                          min={1}
                          value={r.gioi_han_buoi ?? 2}
                          onChange={(e) =>
                            setDmRows((p) => {
                              const n = [...p];
                              n[i] = { ...n[i], gioi_han_buoi: parseInt(e.target.value, 10) || undefined };
                              return n;
                            })
                          }
                          className={`${inputCls} py-1`}
                          style={{ ...inputStyle, minWidth: 60 }}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => setDmRows((p) => p.filter((_, j) => j !== i))}
                          className="text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={saveDm} disabled={saving || dmRows.length === 0} className={btnPrimary} style={btnPrimaryStyle}>
            {saving ? "Đang lưu..." : `Lưu ${dmRows.length} định mức`}
          </button>
        </div>
      )}

      {/* Step 4: Ràng buộc */}
      {step === 4 && (
        <div className={card} style={cardBg}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>rule</span>
            <h2 className="font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
              Ràng buộc (tùy chọn)
            </h2>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--color-on-surface-variant)" }}>
            Thêm nhanh các ràng buộc phổ biến. Có thể bỏ qua bước này.
          </p>
          <div className="flex flex-wrap gap-2">
            {RANG_BUOC_PRESETS.map((p) => (
              <button
                key={p.mo_ta}
                onClick={() => addRangBuoc(p.mo_ta, p.loai)}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                style={{
                  background: p.loai === "hard" ? "var(--color-error-container)" : "var(--color-tertiary-container)",
                  color: p.loai === "hard" ? "var(--color-on-error-container)" : "var(--color-on-tertiary-container)",
                }}
              >
                {p.mo_ta}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <DangerZone onTruncate={handleTruncate} onReset={handleReset} saving={saving} />

      {message && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-surface-container-high)" }}>
          {message}
        </div>
      )}
    </div>
  );
}
