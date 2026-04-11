"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getRangBuocList,
  createRangBuoc,
  updateRangBuoc,
  deleteRangBuoc,
  toggleRangBuoc,
} from "@/lib/api";
import type { RangBuoc, RangBuocCreatePayload } from "@/lib/types";

const inputCls = "px-3 py-2 rounded-lg text-sm w-full border";
const inputStyle = {
  borderColor: "var(--color-outline-variant)",
  background: "var(--color-surface-container-lowest)",
  color: "var(--color-on-surface)",
};

const PRESETS: RangBuocCreatePayload[] = [
  { mo_ta: "Giáo viên không dạy quá 5 tiết liên tiếp",              loai: "hard", rule_code: "NO_CONSECUTIVE_5" },
  { mo_ta: "Tối đa 2 tiết/ngày/môn cho 1 lớp",                     loai: "hard", rule_code: "MAX_2_PER_DAY"    },
  { mo_ta: "GVCN có tiết đầu thứ Hai (chào cờ)",                    loai: "hard", rule_code: "GVCN_MONDAY"      },
  { mo_ta: "Không tách buổi với môn chỉ 1 tiết/tuần",               loai: "soft", rule_code: "NO_SPLIT_SESSION" },
  { mo_ta: "Phân phối đều tiết trong tuần",                         loai: "soft", rule_code: "BALANCE_WEEK"     },
  { mo_ta: "Ưu tiên môn chính (Toán, Văn, Anh) vào buổi sáng",     loai: "soft", rule_code: null               },
  { mo_ta: "Không xếp Thể dục tiết cuối ngày",                     loai: "soft", rule_code: null               },
];

export default function RangBuocPage() {
  const [rbList, setRbList]     = useState<RangBuoc[]>([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState("");
  const [loaiFilter, setLoaiFilter] = useState<"" | "hard" | "soft">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const [modal, setModal]       = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<RangBuoc | null>(null);
  const [form, setForm]         = useState<{ mo_ta: string; loai: "hard" | "soft" }>({ mo_ta: "", loai: "hard" });
  const [showPresets, setShowPresets] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setRbList(await getRangBuocList());
    } catch {
      setRbList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = rbList.filter((r) => {
    if (loaiFilter  && r.loai           !== loaiFilter)           return false;
    if (activeFilter && String(r.active) !== activeFilter)        return false;
    return true;
  });

  const openAdd = () => {
    setEditItem(null);
    setForm({ mo_ta: "", loai: "hard" });
    setModal("add");
  };

  const openEdit = (r: RangBuoc) => {
    setEditItem(r);
    setForm({ mo_ta: r.mo_ta, loai: r.loai });
    setModal("edit");
  };

  const save = async () => {
    if (!form.mo_ta.trim()) { setMessage("Mô tả không được để trống."); return; }
    setMessage("");
    try {
      if (modal === "add") {
        await createRangBuoc({ mo_ta: form.mo_ta.trim(), loai: form.loai });
        setMessage("Đã thêm ràng buộc.");
      } else if (editItem) {
        await updateRangBuoc(editItem.id, { mo_ta: form.mo_ta.trim(), loai: form.loai });
        setMessage("Đã cập nhật ràng buộc.");
      }
      setModal(null);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu");
    }
  };

  const handleToggle = async (r: RangBuoc) => {
    setMessage("");
    try {
      await toggleRangBuoc(r.id);
      setMessage(r.active ? "Đã tắt ràng buộc." : "Đã bật ràng buộc.");
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleDelete = async (r: RangBuoc) => {
    if (!confirm(`Xóa ràng buộc: "${r.mo_ta}"?`)) return;
    setMessage("");
    try {
      await deleteRangBuoc(r.id);
      setMessage("Đã xóa ràng buộc.");
      setModal(null);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi xóa");
    }
  };

  const addPreset = async (p: RangBuocCreatePayload) => {
    setMessage("");
    try {
      await createRangBuoc(p);
      setMessage(`Đã thêm: "${p.mo_ta}"`);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const hard = rbList.filter((r) => r.loai === "hard" && r.active).length;
  const soft = rbList.filter((r) => r.loai === "soft" && r.active).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-xl p-8 text-center" style={{ background: "var(--color-surface-container-lowest)" }}>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            Quản lý ràng buộc
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Quy tắc hard/soft áp dụng khi tạo TKB bằng AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPresets((v) => !v)}
            className="px-3 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_fix_high</span>
            Preset
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Thêm ràng buộc
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#fee2e2", color: "#991b1b" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
          {hard} Hard đang bật
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#fef3c7", color: "#92400e" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>tune</span>
          {soft} Soft đang bật
        </span>
      </div>

      {/* Presets panel */}
      {showPresets && (
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: "var(--color-surface-container-lowest)", border: "1px solid var(--color-outline-variant)" }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>
            Thêm nhanh từ preset
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.mo_ta}
                onClick={() => addPreset(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                style={{
                  background: p.loai === "hard" ? "#fee2e2" : "#fef3c7",
                  color:      p.loai === "hard" ? "#991b1b" : "#92400e",
                  border:     `1px solid ${p.loai === "hard" ? "#fca5a5" : "#fcd34d"}`,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                  {p.loai === "hard" ? "lock" : "tune"}
                </span>
                {p.mo_ta}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={loaiFilter}
          onChange={(e) => setLoaiFilter(e.target.value as "" | "hard" | "soft")}
          className="px-4 py-2 rounded-xl text-sm"
          style={inputStyle}
        >
          <option value="">Tất cả loại</option>
          <option value="hard">Hard (bắt buộc)</option>
          <option value="soft">Soft (ưu tiên)</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as "" | "true" | "false")}
          className="px-4 py-2 rounded-xl text-sm"
          style={inputStyle}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang bật</option>
          <option value="false">Đã tắt</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-surface-container)" }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Loại</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Mô tả</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center" style={{ color: "var(--color-outline)" }}>
                    {rbList.length === 0
                      ? "Chưa có ràng buộc. Thêm mới hoặc chọn từ Preset."
                      : "Không có kết quả phù hợp bộ lọc."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: "var(--color-outline-variant)", opacity: r.active ? 1 : 0.5 }}>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: r.loai === "hard" ? "#fee2e2" : "#fef3c7",
                          color:      r.loai === "hard" ? "#991b1b" : "#92400e",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                          {r.loai === "hard" ? "lock" : "tune"}
                        </span>
                        {r.loai === "hard" ? "Hard" : "Soft"}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface)" }}>
                      <p className="font-medium">{r.mo_ta}</p>
                      {r.rule_code && (
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--color-outline)" }}>{r.rule_code}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: r.active ? "#dcfce7" : "#f3f4f6",
                          color:      r.active ? "#166534" : "#6b7280",
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.active ? "#16a34a" : "#9ca3af" }} />
                        {r.active ? "Đang bật" : "Đã tắt"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggle(r)}
                          className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                          style={{
                            background: r.active ? "#f3f4f6" : "#dcfce7",
                            color:      r.active ? "#6b7280" : "#166534",
                          }}
                          title={r.active ? "Tắt ràng buộc" : "Bật ràng buộc"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            {r.active ? "toggle_on" : "toggle_off"}
                          </span>
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                          style={{ background: "var(--color-surface-container-high)", color: "var(--color-primary)" }}
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                          style={{ background: "#fee2e2", color: "#991b1b" }}
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm" style={{ color: "var(--color-outline)" }}>
        Tổng: {filtered.length} ràng buộc {filtered.length !== rbList.length && `(đã lọc từ ${rbList.length})`}
      </p>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setModal(null)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "var(--color-surface-container-lowest)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
              {modal === "add" ? "Thêm ràng buộc" : "Sửa ràng buộc"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Loại</label>
                <div className="flex gap-2">
                  {(["hard", "soft"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setForm((p) => ({ ...p, loai: v }))}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: form.loai === v
                          ? (v === "hard" ? "#fee2e2" : "#fef3c7")
                          : "var(--color-surface-container)",
                        color: form.loai === v
                          ? (v === "hard" ? "#991b1b" : "#92400e")
                          : "var(--color-on-surface-variant)",
                        border: form.loai === v
                          ? `1.5px solid ${v === "hard" ? "#fca5a5" : "#fcd34d"}`
                          : "1.5px solid transparent",
                      }}
                    >
                      {v === "hard" ? "Hard — Bắt buộc" : "Soft — Ưu tiên"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: "var(--color-outline)" }}>
                  {form.loai === "hard"
                    ? "Hard: solver phải thỏa mãn 100%. Vi phạm sẽ bị từ chối."
                    : "Soft: solver cố gắng thỏa nhưng có thể bỏ qua nếu cần."}
                </p>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Mô tả *</label>
                <textarea
                  value={form.mo_ta}
                  onChange={(e) => setForm((p) => ({ ...p, mo_ta: e.target.value }))}
                  className={inputCls}
                  style={{ ...inputStyle, resize: "vertical" }}
                  rows={3}
                  placeholder="Mô tả ràng buộc bằng ngôn ngữ tự nhiên..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={save}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Lưu
              </button>
              {modal === "edit" && editItem && (
                <button
                  onClick={() => handleDelete(editItem)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
                >
                  Xóa
                </button>
              )}
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--color-surface-container-high)" }}>
          {message}
        </div>
      )}
    </div>
  );
}
