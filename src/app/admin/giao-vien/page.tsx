"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getGiaoVienList,
  getPhanCongList,
  getLopHocList,
  getMonChoGv,
  syncGvcnFromLop,
  createGiaoVien,
  updateGiaoVien,
  deleteGiaoVien,
  createPhanCong,
  updatePhanCong,
  deletePhanCong,
} from "@/lib/api";
import type { GiaoVien, PhanCong, LopHoc } from "@/lib/types";

const inputCls = "px-3 py-2 rounded-lg text-sm w-full border";
const inputStyle = {
  borderColor: "var(--color-outline-variant)",
  background: "var(--color-surface-container-lowest)",
  color: "var(--color-on-surface)",
};

export default function GiaoVienPage() {
  const [giaoVien, setGiaoVien] = useState<GiaoVien[]>([]);
  const [phanCong, setPhanCong] = useState<PhanCong[]>([]);
  const [lopHoc, setLopHoc] = useState<LopHoc[]>([]);
  const [pcMonOptions, setPcMonOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const [gvModal, setGvModal] = useState<"add" | "edit" | null>(null);
  const [gvEdit, setGvEdit] = useState<GiaoVien | null>(null);
  const [gvForm, setGvForm] = useState({ ho_ten: "", to_chuyen_mon: "", chuc_vu: "", lop_chu_nhiem: "" });

  const [pcModal, setPcModal] = useState<"add" | "edit" | null>(null);
  const [pcEdit, setPcEdit] = useState<PhanCong | null>(null);
  const [pcForm, setPcForm] = useState({ ma_gv: "", lop: "", mon: "", so_tiet_tuan: 4 });
  const [pcForGv, setPcForGv] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [gv, pc, lop] = await Promise.all([
        getGiaoVienList(),
        getPhanCongList(),
        getLopHocList(),
      ]);
      setGiaoVien(gv);
      setPhanCong(pc);
      setLopHoc(lop);
    } catch {
      setGiaoVien([]);
      setPhanCong([]);
      setLopHoc([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!pcModal || !pcForm.ma_gv) {
      setPcMonOptions([]);
      return;
    }
    let cancelled = false;
    getMonChoGv(pcForm.ma_gv)
      .then((r) => {
        if (!cancelled) setPcMonOptions(r.mon ?? []);
      })
      .catch(() => {
        if (!cancelled) setPcMonOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pcModal, pcForm.ma_gv]);

  const toList = useMemo(() => {
    const set = new Set(giaoVien.map((g) => g.to_chuyen_mon).filter(Boolean));
    return Array.from(set).sort();
  }, [giaoVien]);

  const pcByGv = useMemo(() => {
    const m = new Map<string, PhanCong[]>();
    for (const p of phanCong) {
      if (!m.has(p.ma_gv)) m.set(p.ma_gv, []);
      m.get(p.ma_gv)!.push(p);
    }
    return m;
  }, [phanCong]);

  const filtered = useMemo(() => {
    return giaoVien.filter((g) => {
      if (search && !g.ho_ten.toLowerCase().includes(search.toLowerCase()) && !g.ma_gv.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (toFilter && g.to_chuyen_mon !== toFilter) return false;
      if (activeFilter !== null && g.active !== activeFilter) return false;
      return true;
    });
  }, [giaoVien, search, toFilter, activeFilter]);

  const tongTiet = (g: GiaoVien) => {
    const fromPc = (pcByGv.get(g.ma_gv) ?? []).reduce((s, p) => s + p.so_tiet_tuan, 0);
    return fromPc > 0 ? fromPc : (g.tong_tiet ?? g.so_tiet_chuan ?? 0);
  };

  const openAddGv = () => {
    setGvEdit(null);
    setGvForm({ ho_ten: "", to_chuyen_mon: "", chuc_vu: "", lop_chu_nhiem: "" });
    setGvModal("add");
  };

  const openEditGv = (g: GiaoVien) => {
    setGvEdit(g);
    setGvForm({
      ho_ten: g.ho_ten,
      to_chuyen_mon: g.to_chuyen_mon ?? "",
      chuc_vu: g.chuc_vu ?? "",
      lop_chu_nhiem: g.lop_chu_nhiem ?? "",
    });
    setGvModal("edit");
  };

  const saveGv = async () => {
    if (!gvForm.ho_ten.trim()) {
      setMessage("Họ tên không được để trống.");
      return;
    }
    setMessage("");
    try {
      if (gvModal === "add") {
        await createGiaoVien({
          ho_ten: gvForm.ho_ten,
          to_chuyen_mon: gvForm.to_chuyen_mon || undefined,
          chuc_vu: gvForm.chuc_vu || undefined,
          lop_chu_nhiem: gvForm.lop_chu_nhiem || undefined,
        });
        setMessage("Đã thêm giáo viên.");
      } else if (gvEdit) {
        await updateGiaoVien(gvEdit.ma_gv, {
          ho_ten: gvForm.ho_ten,
          to_chuyen_mon: gvForm.to_chuyen_mon || undefined,
          chuc_vu: gvForm.chuc_vu || undefined,
          lop_chu_nhiem: gvForm.lop_chu_nhiem || undefined,
        });
        setMessage("Đã cập nhật giáo viên.");
      }
      setGvModal(null);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu");
    }
  };

  const handleDeleteGv = async (g: GiaoVien) => {
    if (!confirm(`Chuyển ${g.ho_ten} sang trạng thái Ngưng?`)) return;
    setMessage("");
    try {
      await deleteGiaoVien(g.ma_gv);
      setMessage("Đã chuyển trạng thái Ngưng.");
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const handleReactivateGv = async (g: GiaoVien) => {
    setMessage("");
    try {
      await updateGiaoVien(g.ma_gv, { active: true });
      setMessage("Đã chuyển hoạt động trở lại.");
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi");
    }
  };

  const openAddPc = (ma_gv: string) => {
    setPcEdit(null);
    setPcForGv(ma_gv);
    setPcForm({ ma_gv, lop: "", mon: "", so_tiet_tuan: 4 });
    setPcModal("add");
  };

  const openEditPc = (p: PhanCong) => {
    setPcEdit(p);
    setPcForGv(null);
    setPcForm({ ma_gv: p.ma_gv, lop: p.lop, mon: p.mon, so_tiet_tuan: p.so_tiet_tuan });
    setPcModal("edit");
  };

  const savePc = async () => {
    const lop = pcForm.lop.trim();
    const mon = pcForm.mon.trim();
    if (!pcForm.ma_gv || !lop || !mon || pcForm.so_tiet_tuan < 1) {
      setMessage("Mã GV, lớp, môn và số tiết bắt buộc.");
      return;
    }
    const payload = { ...pcForm, lop, mon };
    setMessage("");
    try {
      if (pcModal === "add") {
        await createPhanCong(payload);
        setMessage("Đã thêm phân công.");
      } else if (pcEdit) {
        await updatePhanCong(pcEdit.id, payload);
        setMessage("Đã cập nhật phân công.");
      }
      setPcModal(null);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi lưu phân công");
    }
  };

  const handleDeletePc = async (p: PhanCong) => {
    if (!confirm(`Xóa phân công ${p.lop}-${p.mon}?`)) return;
    setMessage("");
    try {
      await deletePhanCong(p.id);
      setMessage("Đã xóa phân công.");
      setPcModal(null);
      loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Lỗi xóa");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="rounded-xl p-8 text-center" style={{ background: "var(--color-surface-container-lowest)" }}>
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
            Quản lý giáo viên
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Danh sách giáo viên, phân công giảng dạy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                const r = await syncGvcnFromLop();
                setMessage(r.message);
                loadData();
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Lỗi");
              }
            }}
            className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}
            title="Đồng bộ Lớp CN từ Quản lý lớp"
          >
            Đồng bộ GVCN
          </button>
          <button
            onClick={openAddGv}
            className="px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
            Thêm giáo viên
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã GV..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm border"
          style={inputStyle}
        />
        <select
          value={toFilter}
          onChange={(e) => setToFilter(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm"
          style={inputStyle}
        >
          <option value="">Tất cả (không lọc tổ)</option>
          {toList.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={activeFilter === null ? "" : String(activeFilter)}
          onChange={(e) => setActiveFilter(e.target.value === "" ? null : e.target.value === "true")}
          className="px-4 py-2 rounded-xl text-sm"
          style={inputStyle}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Ngưng</option>
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface-container-lowest)", boxShadow: "0 2px 8px rgba(30,58,138,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--color-surface-container)" }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Mã GV</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Họ tên</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Tổ / bộ môn</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Chức vụ</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Lớp CN</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Tổng tiết</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Phân công</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--color-on-surface)" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center" style={{ color: "var(--color-outline)" }}>
                    Chưa có dữ liệu. Hãy nhập tại trang Nhập dữ liệu hoặc thêm giáo viên.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr
                    key={g.ma_gv}
                    className="border-t"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <td className="py-3 px-4 font-mono" style={{ color: "var(--color-on-surface)" }}>{g.ma_gv}</td>
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--color-on-surface)" }}>{g.ho_ten}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface-variant)" }}>{g.to_chuyen_mon ?? "—"}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface-variant)" }}>{g.chuc_vu ?? "—"}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface-variant)" }}>{g.lop_chu_nhiem ?? "—"}</td>
                    <td className="py-3 px-4" style={{ color: "var(--color-on-surface)" }}>{tongTiet(g)}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 items-center">
                        {(pcByGv.get(g.ma_gv) ?? []).map((p) => (
                          <span
                            key={p.id}
                            onClick={() => openEditPc(p)}
                            className="px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80"
                            style={{ background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)" }}
                            title="Nhấn để sửa"
                          >
                            {p.lop}-{p.mon}
                          </span>
                        ))}
                        <button
                          onClick={() => openAddPc(g.ma_gv)}
                          className="p-0.5 rounded hover:bg-black/10"
                          title="Thêm phân công"
                        >
                          <span className="material-symbols-outlined text-base" style={{ color: "var(--color-primary)" }}>add_circle</span>
                        </button>
                        {(pcByGv.get(g.ma_gv) ?? []).length === 0 && !pcByGv.has(g.ma_gv) && (
                          <span className="text-xs" style={{ color: "var(--color-outline)" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: g.active ? "#dcfce7" : "#f3f4f6",
                          color: g.active ? "#166534" : "#6b7280",
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{ background: g.active ? "#16a34a" : "#9ca3af" }} />
                        {g.active ? "Hoạt động" : "Ngưng"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditGv(g)}
                          className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                          style={{ background: "var(--color-surface-container-high)", color: "var(--color-primary)" }}
                          title="Sửa thông tin"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                        </button>
                        {g.active ? (
                          <button
                            onClick={() => handleDeleteGv(g)}
                            className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                            style={{ background: "#fee2e2", color: "#991b1b" }}
                            title="Chuyển Ngưng"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>block</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivateGv(g)}
                            className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                            style={{ background: "#dcfce7", color: "#166534" }}
                            title="Kích hoạt lại"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>play_circle</span>
                          </button>
                        )}
                        <Link
                          href={`/admin/xem-tkb?gv=${encodeURIComponent(g.ma_gv)}`}
                          className="p-1.5 rounded-lg hover:opacity-75 transition-opacity"
                          style={{ background: "var(--color-surface-container-high)", color: "var(--color-primary)" }}
                          title="Xem TKB"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_view_week</span>
                        </Link>
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
        Tổng: {filtered.length} giáo viên {filtered.length !== giaoVien.length && `(đã lọc từ ${giaoVien.length})`}
      </p>

      {/* Modal giáo viên */}
      {gvModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setGvModal(null)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "var(--color-surface-container-lowest)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
              {gvModal === "add" ? "Thêm giáo viên" : "Sửa giáo viên"}
            </h3>
            <div className="space-y-3">
              {gvModal === "edit" && gvEdit && (
                <div>
                  <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Mã GV</label>
                  <input value={gvEdit.ma_gv} disabled className={inputCls} style={inputStyle} />
                </div>
              )}
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Họ tên *</label>
                <input
                  value={gvForm.ho_ten}
                  onChange={(e) => setGvForm((p) => ({ ...p, ho_ten: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Họ và tên"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Tổ / bộ môn</label>
                <input
                  value={gvForm.to_chuyen_mon}
                  onChange={(e) => setGvForm((p) => ({ ...p, to_chuyen_mon: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Nhập tay, vd: Tổ Toán"
                  list="gv-to-bm-suggestions"
                />
                <datalist id="gv-to-bm-suggestions">
                  {toList.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>
                  Gợi ý lấy từ các giáo viên đã có; có thể nhập tùy ý.
                </p>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Chức vụ</label>
                <input
                  value={gvForm.chuc_vu}
                  onChange={(e) => setGvForm((p) => ({ ...p, chuc_vu: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="GV"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Lớp CN</label>
                <input
                  value={gvForm.lop_chu_nhiem}
                  onChange={(e) => setGvForm((p) => ({ ...p, lop_chu_nhiem: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="6/1 hoặc để trống"
                  list="gv-lopcn-list"
                />
                <datalist id="gv-lopcn-list">
                  {lopHoc.map((l) => (
                    <option key={l.id} value={l.ten_lop} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={saveGv}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Lưu
              </button>
              <button
                onClick={() => setGvModal(null)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface)" }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal phân công */}
      {pcModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setPcModal(null)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "var(--color-surface-container-lowest)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
              {pcModal === "add" ? "Thêm phân công" : "Sửa phân công"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Giáo viên</label>
                <select
                  value={pcForm.ma_gv}
                  onChange={(e) => setPcForm((p) => ({ ...p, ma_gv: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  disabled={!!pcForGv}
                >
                  {giaoVien.filter((g) => g.active).map((g) => (
                    <option key={g.ma_gv} value={g.ma_gv}>{g.ma_gv} - {g.ho_ten}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Lớp</label>
                <input
                  value={pcForm.lop}
                  onChange={(e) => setPcForm((p) => ({ ...p, lop: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="6/1"
                  list="pc-lop-list"
                />
                <datalist id="pc-lop-list">
                  {lopHoc.map((l) => (
                    <option key={l.id} value={l.ten_lop} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Môn</label>
                <input
                  value={pcForm.mon}
                  onChange={(e) => setPcForm((p) => ({ ...p, mon: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                  placeholder="Gõ tên môn hoặc chọn gợi ý"
                  list="pc-mon-datalist"
                />
                <datalist id="pc-mon-datalist">
                  {pcMonOptions.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                {pcMonOptions.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>
                    Gợi ý từ Định mức. <strong>Chào cờ</strong> / <strong>Sinh hoạt lớp</strong> chỉ hợp lệ nếu GV là chủ nhiệm.
                  </p>
                )}
                {pcMonOptions.length === 0 && pcForm.ma_gv && (
                  <p className="text-xs mt-1" style={{ color: "var(--color-outline)" }}>
                    Chưa có Định mức — vẫn có thể nhập tên môn và số tiết; BE sẽ kiểm tra khi lưu.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-outline)" }}>Số tiết/tuần</label>
                <input
                  type="number"
                  min={1}
                  value={pcForm.so_tiet_tuan}
                  onChange={(e) => setPcForm((p) => ({ ...p, so_tiet_tuan: parseInt(e.target.value, 10) || 0 }))}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={savePc}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
              >
                Lưu
              </button>
              {pcModal === "edit" && pcEdit && (
                <button
                  onClick={() => handleDeletePc(pcEdit)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}
                >
                  Xóa
                </button>
              )}
              <button
                onClick={() => setPcModal(null)}
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
