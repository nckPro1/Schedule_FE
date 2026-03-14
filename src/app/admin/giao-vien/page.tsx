"use client";

import { useState } from "react";
import { giaoVienMock, phanCongMock, lopHocMock } from "@/lib/mock-data";
import type { GiaoVien, PhanCong } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CHUC_VU_OPTIONS = ["TTCM", "TPCM", "PHT", "HT", "HĐ"];
const CHUC_VU_COLORS: Record<string, { bg: string; text: string }> = {
  TTCM: { bg: "#dbeafe", text: "#1e3a8a" },
  TPCM: { bg: "#e0e7ff", text: "#3730a3" },
  PHT:  { bg: "#ede9fe", text: "#4c1d95" },
  HT:   { bg: "#fee2e2", text: "#991b1b" },
  HĐ:   { bg: "#fef9c3", text: "#713f12" },
};

const MON_OPTIONS = ["Toán", "Ngữ Văn", "Tiếng Anh", "KHTN", "Lịch Sử", "Địa Lý", "GDCD", "Thể Dục", "Âm Nhạc", "Mỹ Thuật", "Tin học"];

function getToList() { return [...new Set(giaoVienMock.map((g) => g.to_chuyen_mon))]; }
function getLopList() { return lopHocMock.map((l) => l.ten_lop).sort(); }

// ─── GV Form Modal ────────────────────────────────────────────────────────────
interface GVFormProps {
  initial?: GiaoVien | null;
  onClose: () => void;
  onSave: (data: Partial<GiaoVien>) => void;
}
function GVFormModal({ initial, onClose, onSave }: GVFormProps) {
  const [form, setForm] = useState({
    ho_ten: initial?.ho_ten ?? "",
    to_chuyen_mon: initial?.to_chuyen_mon ?? "",
    chuc_vu: initial?.chuc_vu ?? "",
    so_tiet_chuan: initial?.so_tiet_chuan ?? 19,
    lop_chu_nhiem: initial?.lop_chu_nhiem ?? "",
    active: initial?.active ?? true,
  });
  const [error, setError] = useState("");

  function handleSave() {
    if (!form.ho_ten.trim()) { setError("Vui lòng nhập họ tên"); return; }
    if (!form.to_chuyen_mon.trim()) { setError("Vui lòng nhập tổ bộ môn"); return; }
    onSave({
      ...form,
      chuc_vu: form.chuc_vu || null,
      lop_chu_nhiem: form.lop_chu_nhiem || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--color-surface-container-lowest)" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {initial ? "edit" : "person_add"}
            </span>
            <span className="font-bold">{initial ? `Sửa: ${initial.ho_ten}` : "Thêm giáo viên mới"}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>Họ và tên *</label>
              <input className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                placeholder="vd: Nguyễn Văn An"
                value={form.ho_ten}
                onChange={(e) => setForm({ ...form, ho_ten: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>Tổ bộ môn *</label>
              <input className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                placeholder="vd: Toán - Tin"
                list="to-list"
                value={form.to_chuyen_mon}
                onChange={(e) => setForm({ ...form, to_chuyen_mon: e.target.value })} />
              <datalist id="to-list">
                {getToList().map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>Chức vụ</label>
              <select className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                value={form.chuc_vu}
                onChange={(e) => setForm({ ...form, chuc_vu: e.target.value })}>
                <option value="">-- Không có --</option>
                {CHUC_VU_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>Số tiết chuẩn</label>
              <input type="number" min={14} max={25}
                className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                value={form.so_tiet_chuan}
                onChange={(e) => setForm({ ...form, so_tiet_chuan: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>Lớp chủ nhiệm</label>
              <select className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                value={form.lop_chu_nhiem ?? ""}
                onChange={(e) => setForm({ ...form, lop_chu_nhiem: e.target.value })}>
                <option value="">-- Không có --</option>
                {getLopList().map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Trạng thái</label>
              <button type="button"
                onClick={() => setForm({ ...form, active: !form.active })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: form.active ? "#dcfce7" : "var(--color-surface-container)",
                  color: form.active ? "#15803d" : "var(--color-outline)",
                }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {form.active ? "check_circle" : "cancel"}
                </span>
                {form.active ? "Đang dạy" : "Không dạy"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
              {error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
            Huỷ
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            {initial ? "Lưu thay đổi" : "Thêm giáo viên"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Phân Công Modal ──────────────────────────────────────────────────────────
interface PCModalProps {
  gv: GiaoVien;
  pcs: PhanCong[];
  onClose: () => void;
  onChange: () => void;
}
function PhanCongModal({ gv, pcs, onClose, onChange }: PCModalProps) {
  const [newLop, setNewLop] = useState("");
  const [newMon, setNewMon] = useState("");
  const [newTiet, setNewTiet] = useState(4);
  const [error, setError] = useState("");

  const total = pcs.reduce((s, p) => s + p.so_tiet_tuan, 0);
  const overload = total > gv.so_tiet_chuan + 2 || total < gv.so_tiet_chuan - 4;

  function handleAdd() {
    setError("");
    if (!newLop) { setError("Chọn lớp"); return; }
    if (!newMon) { setError("Chọn môn"); return; }
    const dup = phanCongMock.find((p) => p.ma_gv === gv.ma_gv && p.lop === newLop && p.mon === newMon);
    if (dup) { setError("Phân công này đã tồn tại"); return; }
    phanCongMock.push({ id: Date.now(), ma_gv: gv.ma_gv, lop: newLop, mon: newMon, so_tiet_tuan: newTiet });
    setNewLop(""); setNewMon(""); setNewTiet(4);
    onChange();
  }

  function handleDelete(id: number) {
    const idx = phanCongMock.findIndex((p) => p.id === id);
    if (idx !== -1) { phanCongMock.splice(idx, 1); onChange(); }
  }

  function handleChangeTiet(id: number, val: number) {
    const pc = phanCongMock.find((p) => p.id === id);
    if (pc) { pc.so_tiet_tuan = val; onChange(); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--color-surface-container-lowest)" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: "var(--color-secondary)", color: "var(--color-on-secondary)" }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>assignment</span>
            <span className="font-bold">Phân công — {gv.ho_ten}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Tổng tiết */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: overload ? "#fee2e2" : "#dcfce7", color: overload ? "#991b1b" : "#15803d" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {overload ? "warning" : "check_circle"}
            </span>
            <span className="font-semibold">
              Tổng: <strong>{total}</strong> tiết / Chuẩn: <strong>{gv.so_tiet_chuan}</strong> tiết
              {overload ? " — Lệch định mức!" : " — Hợp lệ"}
            </span>
          </div>

          {/* Danh sách phân công */}
          {pcs.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "var(--color-outline)" }}>Chưa có phân công nào</p>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-outline-variant)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--color-surface-container-low)" }}>
                    {["Lớp", "Môn", "Tiết/tuần", ""].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-outline)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pcs.map((pc) => (
                    <tr key={pc.id} style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
                      <td className="px-4 py-2.5 font-bold" style={{ color: "var(--color-primary)" }}>{pc.lop}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                          {pc.mon}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min={1} max={10}
                          className="w-16 px-2 py-1 rounded-lg text-sm text-center border-none outline-none font-bold"
                          style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                          value={pc.so_tiet_tuan}
                          onChange={(e) => handleChangeTiet(pc.id, Number(e.target.value))} />
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => handleDelete(pc.id)}
                          className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Thêm phân công mới */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--color-surface-container-low)" }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Thêm phân công mới</p>
            <div className="grid grid-cols-3 gap-2">
              <select className="px-3 py-2 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                value={newLop} onChange={(e) => setNewLop(e.target.value)}>
                <option value="">Chọn lớp</option>
                {getLopList().map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="px-3 py-2 rounded-xl text-sm border-none outline-none"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                value={newMon} onChange={(e) => setNewMon(e.target.value)}>
                <option value="">Chọn môn</option>
                {MON_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="number" min={1} max={10}
                className="px-3 py-2 rounded-xl text-sm border-none outline-none text-center"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                placeholder="Tiết"
                value={newTiet}
                onChange={(e) => setNewTiet(Number(e.target.value))} />
            </div>
            {error && (
              <p className="text-xs px-3 py-1.5 rounded-lg"
                style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                {error}
              </p>
            )}
            <button onClick={handleAdd}
              className="w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Thêm phân công
            </button>
          </div>
        </div>

        <div className="px-6 py-3 flex justify-end" style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GiaoVienPage() {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);

  const [search, setSearch] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [gvModal, setGvModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<GiaoVien | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GiaoVien | null>(null);
  const [pcTarget, setPcTarget] = useState<GiaoVien | null>(null);

  const toList = getToList();

  const filtered = giaoVienMock.filter((gv) => {
    const matchSearch = !search ||
      gv.ma_gv.toLowerCase().includes(search.toLowerCase()) ||
      gv.ho_ten.toLowerCase().includes(search.toLowerCase());
    const matchTo = !filterTo || gv.to_chuyen_mon === filterTo;
    const matchActive = filterActive === "all" || (filterActive === "active" ? gv.active : !gv.active);
    return matchSearch && matchTo && matchActive;
  });

  function handleSaveGV(data: Partial<GiaoVien>) {
    if (gvModal === "add") {
      const newId = Math.max(...giaoVienMock.map((g) => g.id)) + 1;
      const hoTen = data.ho_ten ?? "";
      const parts = hoTen.trim().split(" ");
      const ten = parts[parts.length - 1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const initials = parts.slice(0, -1).map((p) => p[0]?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "").join("");
      let maGv = ten + initials;
      let suffix = 1;
      while (giaoVienMock.some((g) => g.ma_gv === maGv)) { maGv = `${ten}${initials}${String(suffix).padStart(2, "0")}`; suffix++; }
      giaoVienMock.push({ id: newId, ma_gv: maGv, ho_ten: hoTen, to_chuyen_mon: data.to_chuyen_mon ?? "", chuc_vu: data.chuc_vu ?? null, so_tiet_chuan: data.so_tiet_chuan ?? 19, lop_chu_nhiem: data.lop_chu_nhiem ?? null, active: data.active ?? true });
    } else if (gvModal === "edit" && editTarget) {
      Object.assign(editTarget, data);
    }
    refresh();
    setGvModal(null);
    setEditTarget(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const idx = giaoVienMock.findIndex((g) => g.ma_gv === deleteTarget.ma_gv);
    if (idx !== -1) giaoVienMock.splice(idx, 1);
    refresh();
    setDeleteTarget(null);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            Quản lý giáo viên
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            {giaoVienMock.filter((g) => g.active).length} đang dạy · {giaoVienMock.length} tổng cộng
          </p>
        </div>
        <button onClick={() => { setEditTarget(null); setGvModal("add"); }}
          className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Thêm giáo viên
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 flex flex-wrap gap-3 items-center"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[200px]"
          style={{ background: "var(--color-surface-container-highest)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>search</span>
          <input className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: "var(--color-on-surface)" }}
            placeholder="Tìm theo mã GV hoặc họ tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-outline)" }}>close</span>
            </button>
          )}
        </div>
        <select className="px-4 py-2.5 rounded-xl text-sm border-none outline-none"
          style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
          value={filterTo} onChange={(e) => setFilterTo(e.target.value)}>
          <option value="">Tất cả tổ</option>
          {toList.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--color-surface-container)" }}>
          {(["all", "active", "inactive"] as const).map((v) => (
            <button key={v} onClick={() => setFilterActive(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filterActive === v ? "var(--color-primary)" : "transparent",
                color: filterActive === v ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}>
              {v === "all" ? "Tất cả" : v === "active" ? "Đang dạy" : "Không dạy"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)", border: "1px solid var(--color-outline-variant)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-surface-container-low)" }}>
                {["Mã GV", "Họ tên", "Tổ bộ môn", "Chức vụ", "Lớp CN", "Tiết chuẩn", "Phân công", "Trạng thái", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--color-on-surface-variant)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-sm" style={{ color: "var(--color-outline)" }}>Không tìm thấy giáo viên nào</td></tr>
              ) : filtered.map((gv) => {
                const pcs = phanCongMock.filter((p) => p.ma_gv === gv.ma_gv);
                const total = pcs.reduce((s, p) => s + p.so_tiet_tuan, 0);
                const overload = total > gv.so_tiet_chuan + 2 || total < gv.so_tiet_chuan - 4;
                const cv = gv.chuc_vu ? CHUC_VU_COLORS[gv.chuc_vu] : null;
                return (
                  <tr key={gv.ma_gv} className="hover:bg-black/[0.02] transition-colors"
                    style={{ borderTop: "1px solid var(--color-outline-variant)", opacity: gv.active ? 1 : 0.5 }}>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: "var(--color-primary)" }}>{gv.ma_gv}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: "var(--color-on-surface)" }}>{gv.ho_ten}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: "var(--color-on-surface-variant)" }}>{gv.to_chuyen_mon}</td>
                    <td className="px-4 py-3">
                      {cv ? (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: cv.bg, color: cv.text }}>{gv.chuc_vu}</span>
                      ) : <span style={{ color: "var(--color-outline)" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--color-on-surface-variant)" }}>
                      {gv.lop_chu_nhiem ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-sm" style={{ color: overload ? "#ef4444" : "var(--color-on-surface)" }}>{total}</span>
                      <span className="text-xs ml-1" style={{ color: "var(--color-outline)" }}>/{gv.so_tiet_chuan}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {pcs.slice(0, 3).map((pc) => (
                          <span key={pc.id} className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                            {pc.mon} {pc.lop}
                          </span>
                        ))}
                        {pcs.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
                            +{pcs.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: gv.active ? "#dcfce7" : "#fee2e2", color: gv.active ? "#15803d" : "#991b1b" }}>
                        {gv.active ? "Đang dạy" : "Không dạy"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setPcTarget(gv)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                          style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>assignment</span>
                          PC
                        </button>
                        <button onClick={() => { setEditTarget(gv); setGvModal("edit"); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                          style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>edit</span>
                          Sửa
                        </button>
                        <a href={`/admin/xem-tkb?gv=${gv.ma_gv}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                          style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_view_week</span>
                          TKB
                        </a>
                        <button onClick={() => setDeleteTarget(gv)}
                          className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs" style={{ color: "var(--color-outline)" }}>
        Hiển thị {filtered.length} / {giaoVienMock.length} giáo viên
      </p>

      {/* GV Add/Edit Modal */}
      {gvModal && (
        <GVFormModal
          initial={gvModal === "edit" ? editTarget : null}
          onClose={() => { setGvModal(null); setEditTarget(null); }}
          onSave={handleSaveGV}
        />
      )}

      {/* Phân công Modal */}
      {pcTarget && (
        <PhanCongModal
          gv={pcTarget}
          pcs={phanCongMock.filter((p) => p.ma_gv === pcTarget.ma_gv)}
          onClose={() => setPcTarget(null)}
          onChange={refresh}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--color-surface-container-lowest)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-error-container)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-error)" }}>delete_forever</span>
              </div>
              <div>
                <p className="font-bold" style={{ color: "var(--color-on-surface)" }}>Xoá {deleteTarget.ho_ten}?</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                Huỷ
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "var(--color-error)", color: "var(--color-on-error)" }}>
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
