"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDinhMucList,
  createDinhMuc,
  updateDinhMuc,
  deleteDinhMuc,
} from "@/lib/api";
import type { DinhMuc } from "@/lib/types";

const inputCls = "px-3 py-2 rounded-lg text-sm w-full border";
const inputStyle = {
  borderColor: "var(--color-outline-variant)",
  background: "var(--color-surface-container-lowest)",
  color: "var(--color-on-surface)",
};

const KHOI_OPTIONS = ["Khối 6", "Khối 7", "Khối 8", "Khối 9"];

export default function DinhMucPage() {
  const [dinhMuc, setDinhMuc] = useState<DinhMuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [khoiFilter, setKhoiFilter] = useState<string>("");
  const [message, setMessage] = useState("");

  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<DinhMuc | null>(null);
  const [form, setForm] = useState({ khoi: "Khối 6", mon: "", so_tiet_tuan: 4, gioi_han_buoi: 2 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getDinhMucList(khoiFilter || undefined);
      setDinhMuc(list);
    } catch {
      setDinhMuc([]);
    } finally {
      setLoading(false);
    }
  }, [khoiFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = dinhMuc;

  const openAdd = () => {
    setEditItem(null);
    setForm({ khoi: "Khối 6", mon: "", so_tiet_tuan: 4, gioi_han_buoi: 2 });
    setModal("add");
  };

  const openEdit = (dm: DinhMuc) => {
    setEditItem(dm);
    setForm({
      khoi: dm.khoi,
      mon: dm.mon,
      so_tiet_tuan: dm.so_tiet_tuan ?? 4,
      gioi_han_buoi: dm.gioi_han_buoi ?? 2,
    });
    setModal("edit");
  };

  const save = async () => {
    if (!form.khoi || !form.mon.trim()) {
      setMessage("Khối và môn không được để trống.");
      return;
    }
    setMessage("");
    try {
      if (modal === "add") {
        await createDinhMuc({
          khoi: form.khoi,
          mon: form.mon.trim(),
          so_tiet_tuan: form.so_tiet_tuan,
          gioi_han_buoi: form.gioi_han_buoi,
        });
        setMessage("Đã thêm định mức.");
      } else if (editItem?.id) {
        await updateDinhMuc(editItem.id, {
          khoi: form.khoi,
          mon: form.mon.trim(),
          so_tiet_tuan: form.so_tiet_tuan,
          gioi_han_buoi: form.gioi_han_buoi,
        });
        setMessage("Đã cập nhật định mức.");
      }
      setModal(null);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu");
    }
  };

  const handleDelete = async (dm: DinhMuc) => {
    if (!dm.id) return;
    if (!confirm(`Xóa định mức ${dm.khoi} - ${dm.mon}?`)) return;
    setMessage("");
    try {
      await deleteDinhMuc(dm.id);
      setMessage("Đã xóa định mức.");
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi xóa");
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            Quản lý định mức
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Số tiết/tuần theo khối và môn học, giới hạn tiết/buổi
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Thêm định mức
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={khoiFilter}
          onChange={(e) => setKhoiFilter(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm"
          style={inputStyle}
        >
          <option value="">Tất cả khối</option>
          {KHOI_OPTIONS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-surface-container)" }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Khối</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Môn</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Số tiết/tuần</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>GH tiết/buổi</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center" style={{ color: "var(--color-outline)" }}>
                    Chưa có định mức. Hãy thêm hoặc nhập từ trang Nhập dữ liệu.
                  </td>
                </tr>
              ) : (
                filtered.map((dm) => (
                  <tr
                    key={dm.id ?? `${dm.khoi}-${dm.mon}`}
                    className="border-t"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--color-on-surface)" }}>{dm.khoi}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface-variant)" }}>{dm.mon}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface-variant)" }}>{dm.so_tiet_tuan ?? "—"}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface-variant)" }}>{dm.gioi_han_buoi ?? "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(dm)}
                          className="p-1.5 rounded-lg hover:opacity-80"
                          style={{ background: "var(--color-surface-container)", color: "var(--color-primary)" }}
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(dm)}
                          className="p-1.5 rounded-lg hover:opacity-80"
                          style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
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
        Tổng: {filtered.length} định mức
      </p>

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
              {modal === "add" ? "Thêm định mức" : "Sửa định mức"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Khối *</label>
                <select
                  value={form.khoi}
                  onChange={(e) => setForm((p) => ({ ...p, khoi: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                >
                  {KHOI_OPTIONS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Môn *</label>
                <input
                  value={form.mon}
                  onChange={(e) => setForm((p) => ({ ...p, mon: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Toán, Văn, ..."
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Số tiết/tuần</label>
                <input
                  type="number"
                  min={0}
                  value={form.so_tiet_tuan}
                  onChange={(e) => setForm((p) => ({ ...p, so_tiet_tuan: parseInt(e.target.value, 10) || 0 }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Giới hạn tiết/buổi</label>
                <input
                  type="number"
                  min={1}
                  value={form.gioi_han_buoi}
                  onChange={(e) => setForm((p) => ({ ...p, gioi_han_buoi: parseInt(e.target.value, 10) || 2 }))}
                  className={inputCls}
                  style={inputStyle}
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
