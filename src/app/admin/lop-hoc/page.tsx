"use client";

import { useState } from "react";
import { lopHocMock, giaoVienMock, addLopHoc, updateLopHoc, deleteLopHoc } from "@/lib/mock-data";
import type { LopHoc } from "@/lib/types";

function getGVCNName(maGv: string | null | undefined) {
  if (!maGv) return null;
  const gv = giaoVienMock.find((g) => g.ma_gv === maGv);
  return gv ? gv.ho_ten : maGv;
}

const KHOI_OPTIONS = [6, 7, 8, 9];

type ModalMode = "add" | "edit" | null;

export default function LopHocPage() {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate((n) => n + 1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKhoi, setSelectedKhoi] = useState<number | "">("");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<LopHoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LopHoc | null>(null);

  // Form state
  const [formTenLop, setFormTenLop] = useState("");
  const [formKhoi, setFormKhoi] = useState<number>(6);
  const [formGvcn, setFormGvcn] = useState("");
  const [formError, setFormError] = useState("");

  const filteredLop = lopHocMock.filter((lop) => {
    const matchesSearch = lop.ten_lop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKhoi = selectedKhoi === "" || lop.khoi === selectedKhoi;
    return matchesSearch && matchesKhoi;
  });

  // Group by khoi for display
  const grouped = KHOI_OPTIONS.map((k) => ({
    khoi: k,
    lops: filteredLop.filter((l) => l.khoi === k),
  })).filter((g) => g.lops.length > 0);

  function openAdd() {
    setFormTenLop("");
    setFormKhoi(6);
    setFormGvcn("");
    setFormError("");
    setEditTarget(null);
    setModalMode("add");
  }

  function openEdit(lop: LopHoc) {
    setFormTenLop(lop.ten_lop);
    setFormKhoi(lop.khoi);
    setFormGvcn(lop.gvcn || "");
    setFormError("");
    setEditTarget(lop);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditTarget(null);
    setFormError("");
  }

  function handleSubmit() {
    setFormError("");
    try {
      if (modalMode === "add") {
        if (!formTenLop.trim()) { setFormError("Vui lòng nhập tên lớp"); return; }
        addLopHoc({ ten_lop: formTenLop.trim(), khoi: formKhoi, gvcn: formGvcn || null });
      } else if (modalMode === "edit" && editTarget) {
        updateLopHoc(editTarget.ten_lop, { khoi: formKhoi, gvcn: formGvcn || null });
      }
      refresh();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    try {
      deleteLopHoc(deleteTarget.ten_lop);
      refresh();
      setDeleteTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Có lỗi xảy ra");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline text-2xl lg:text-3xl font-bold" style={{ color: "var(--color-on-surface)" }}>
            Quản lý lớp học
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            {lopHocMock.length} lớp • {filteredLop.length} kết quả
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow transition-all hover:opacity-90"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Thêm lớp mới
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 flex flex-wrap gap-4 items-end"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
            Tìm kiếm
          </label>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "var(--color-surface-container-highest)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-outline)" }}>search</span>
            <input
              className="bg-transparent border-none outline-none text-sm flex-1"
              style={{ color: "var(--color-on-surface)" }}
              placeholder="Nhập tên lớp (6/1, 9/3...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <label className="block text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "var(--color-outline)" }}>
            Khối
          </label>
          <select
            className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
            style={{ background: "var(--color-surface-container-highest)", color: "var(--color-on-surface)" }}
            value={selectedKhoi}
            onChange={(e) => setSelectedKhoi(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Tất cả khối</option>
            {KHOI_OPTIONS.map((k) => <option key={k} value={k}>Khối {k}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setSearchTerm(""); setSelectedKhoi(""); }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
        >
          Xoá lọc
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {KHOI_OPTIONS.map((k) => {
          const count = lopHocMock.filter((l) => l.khoi === k).length;
          return (
            <button
              key={k}
              onClick={() => setSelectedKhoi(selectedKhoi === k ? "" : k)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: selectedKhoi === k ? "var(--color-primary)" : "var(--color-primary-container)",
                color: selectedKhoi === k ? "var(--color-on-primary)" : "var(--color-on-primary-container)",
              }}
            >
              Khối {k} ({count} lớp)
            </button>
          );
        })}
      </div>

      {/* Table grouped by khoi */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--color-surface-container)", color: "var(--color-outline)" }}>
          <span className="material-symbols-outlined mb-2" style={{ fontSize: 36 }}>search_off</span>
          <p className="font-semibold">Không tìm thấy lớp nào</p>
        </div>
      ) : (
        grouped.map(({ khoi, lops }) => (
          <div key={khoi} className="rounded-2xl overflow-hidden"
            style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)", border: "1px solid var(--color-outline-variant)" }}>
            {/* Khoi header */}
            <div className="px-6 py-3 flex items-center gap-3"
              style={{ background: "var(--color-primary-container)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-on-primary-container)" }}>class</span>
              <span className="font-bold text-sm" style={{ color: "var(--color-on-primary-container)" }}>
                Khối {khoi} — {lops.length} lớp
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container-low)" }}>
                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Lớp</th>
                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Khối</th>
                    <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>GVCN</th>
                    <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lops.map((lop, idx) => {
                    const gvcnName = getGVCNName(lop.gvcn);
                    return (
                      <tr key={lop.ten_lop}
                        style={{ borderTop: idx > 0 ? "1px solid var(--color-outline-variant)" : undefined }}
                        className="hover:bg-black/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-base" style={{ color: "var(--color-primary)" }}>{lop.ten_lop}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}>
                            Khối {lop.khoi}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {gvcnName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: "var(--color-tertiary-container)", color: "var(--color-on-tertiary-container)" }}>
                                {gvcnName[0]}
                              </div>
                              <span style={{ color: "var(--color-on-surface)" }}>{gvcnName}</span>
                            </div>
                          ) : (
                            <span className="text-xs italic" style={{ color: "var(--color-outline)" }}>Chưa phân công</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(lop)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                              Sửa
                            </button>
                            <button
                              onClick={() => setDeleteTarget(lop)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                              Xoá
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
        ))
      )}

      {/* Add/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl"
            style={{ background: "var(--color-surface-container-lowest)" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-lg" style={{ color: "var(--color-on-surface)" }}>
                {modalMode === "add" ? "Thêm lớp mới" : `Sửa lớp ${editTarget?.ten_lop}`}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:opacity-70">
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--color-outline)" }}>close</span>
              </button>
            </div>

            <div className="space-y-4">
              {modalMode === "add" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>
                    Tên lớp *
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                    style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                    placeholder="vd: 6/6, 9/7..."
                    value={formTenLop}
                    onChange={(e) => setFormTenLop(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>
                  Khối *
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                  style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                  value={formKhoi}
                  onChange={(e) => setFormKhoi(Number(e.target.value))}
                >
                  {KHOI_OPTIONS.map((k) => <option key={k} value={k}>Khối {k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-outline)" }}>
                  Giáo viên chủ nhiệm
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-none outline-none"
                  style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
                  value={formGvcn}
                  onChange={(e) => setFormGvcn(e.target.value)}
                >
                  <option value="">-- Chưa phân công --</option>
                  {giaoVienMock.filter((g) => g.active).map((g) => (
                    <option key={g.ma_gv} value={g.ma_gv}>{g.ho_ten} ({g.ma_gv})</option>
                  ))}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-sm font-medium px-3 py-2 rounded-lg"
                style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                {formError}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                Huỷ
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                {modalMode === "add" ? "Thêm lớp" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--color-surface-container-lowest)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--color-error-container)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-error)" }}>delete_forever</span>
              </div>
              <div>
                <h2 className="font-bold" style={{ color: "var(--color-on-surface)" }}>Xoá lớp {deleteTarget.ten_lop}?</h2>
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
