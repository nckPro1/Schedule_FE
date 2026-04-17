/**
 * Mock API layer — không gọi backend.
 * Tất cả dữ liệu lưu localStorage qua data-store để persist qua reload.
 */
import type {
  CanhBao,
  DinhMuc,
  GiaoVien,
  LopHoc,
  PhanCong,
  RangBuoc,
  RangBuocCreatePayload,
  RangBuocUpdatePayload,
  TKBSlot,
} from "@/lib/types";
import {
  MOCK_GIAO_VIEN,
  MOCK_PHAN_CONG,
  MOCK_DINH_MUC,
  MOCK_RANG_BUOC,
  MOCK_TKB,
} from "@/lib/mock-data";
import { store } from "@/lib/data-store";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

function generateMaGv(ho_ten: string, existing: string[]): string {
  const words = removeDiacritics(ho_ten.trim()).toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "gv";
  const firstName = words[words.length - 1];
  const initials = words.slice(0, -1).map((w) => w[0]).join("");
  const base = firstName + initials;
  if (!existing.includes(base)) return base;
  let i = 2;
  while (existing.includes(`${base}${i}`)) i++;
  return `${base}${i}`;
}

// ─── Giáo viên ────────────────────────────────────────────────────────────────

export const getGiaoVienList = async (): Promise<GiaoVien[]> => {
  await delay(); return store.getGv();
};

export const getGiaoVienByMa = async (ma_gv: string): Promise<GiaoVien> => {
  await delay();
  const gv = store.getGv().find((g) => g.ma_gv === ma_gv);
  if (!gv) throw new Error(`Không tìm thấy giáo viên: ${ma_gv}`);
  return { ...gv };
};

export const createGiaoVien = async (payload: Partial<GiaoVien>): Promise<GiaoVien> => {
  await delay();
  const list = store.getGv();
  const newGv: GiaoVien = {
    id: Math.max(0, ...list.map((g) => g.id)) + 1,
    ma_gv: payload.ma_gv ?? generateMaGv(payload.ho_ten ?? "", list.map((g) => g.ma_gv)),
    ho_ten: payload.ho_ten ?? "",
    to_chuyen_mon: payload.to_chuyen_mon ?? "",
    chuc_vu: payload.chuc_vu ?? null,
    lop_chu_nhiem: payload.lop_chu_nhiem ?? null,
    active: payload.active ?? true,
    tong_tiet: payload.tong_tiet ?? 0,
  };
  store.setGv([...list, newGv]);
  return { ...newGv };
};

export const createGiaoVienBulk = async (
  items: Array<{ ma_gv?: string; ho_ten: string; to_chuyen_mon?: string; chuc_vu?: string; lop_chu_nhiem?: string }>
): Promise<GiaoVien[]> => {
  await delay();
  const list = store.getGv();
  const created: GiaoVien[] = items.map((item, i) => ({
    id: Math.max(0, ...list.map((g) => g.id)) + i + 1,
    ma_gv: item.ma_gv ?? generateMaGv(item.ho_ten, [...list.map((g) => g.ma_gv), ...created.slice(0, i).map((g) => g.ma_gv)]),
    ho_ten: item.ho_ten,
    to_chuyen_mon: item.to_chuyen_mon ?? "",
    chuc_vu: item.chuc_vu ?? null,
    lop_chu_nhiem: item.lop_chu_nhiem ?? null,
    active: true,
    tong_tiet: 0,
  }));
  store.setGv([...list, ...created]);
  return created.map((g) => ({ ...g }));
};

export const updateGiaoVien = async (ma_gv: string, payload: Partial<GiaoVien>): Promise<GiaoVien> => {
  await delay();
  const list = store.getGv();
  const idx = list.findIndex((g) => g.ma_gv === ma_gv);
  if (idx < 0) throw new Error(`Không tìm thấy giáo viên: ${ma_gv}`);
  list[idx] = { ...list[idx], ...payload };
  store.setGv(list);
  return { ...list[idx] };
};

export const deleteGiaoVien = async (ma_gv: string): Promise<void> => {
  await delay();
  store.setGv(store.getGv().filter((g) => g.ma_gv !== ma_gv));
};

// ─── Phân công ────────────────────────────────────────────────────────────────

export const getPhanCongList = async (): Promise<PhanCong[]> => {
  await delay(); return store.getPc();
};

export const getPhanCongByMaGv = async (ma_gv: string): Promise<PhanCong[]> => {
  await delay(); return store.getPc().filter((p) => p.ma_gv === ma_gv);
};

export const createPhanCong = async (payload: Partial<PhanCong>): Promise<PhanCong> => {
  await delay();
  const list = store.getPc();
  const pc: PhanCong = {
    id: Math.max(0, ...list.map((p) => p.id)) + 1,
    ma_gv: payload.ma_gv ?? "",
    lop: payload.lop ?? "",
    mon: payload.mon ?? "",
    so_tiet_tuan: payload.so_tiet_tuan ?? 2,
  };
  store.setPc([...list, pc]);
  return { ...pc };
};

export const createPhanCongBulk = async (
  items: Array<{ ma_gv: string; lop: string; mon: string; so_tiet_tuan: number }>
): Promise<PhanCong[]> => {
  await delay();
  const list = store.getPc();
  const created: PhanCong[] = items.map((item, i) => ({
    id: Math.max(0, ...list.map((p) => p.id)) + i + 1,
    ...item,
  }));
  store.setPc([...list, ...created]);
  return created.map((p) => ({ ...p }));
};

export const updatePhanCong = async (id: number, payload: Partial<PhanCong>): Promise<PhanCong> => {
  await delay();
  const list = store.getPc();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy phân công: ${id}`);
  list[idx] = { ...list[idx], ...payload };
  store.setPc(list);
  return { ...list[idx] };
};

export const deletePhanCong = async (id: number): Promise<void> => {
  await delay();
  store.setPc(store.getPc().filter((p) => p.id !== id));
};

export const getMonChoGv = async (ma_gv: string): Promise<{ mon: string[] }> => {
  await delay();
  const mons = [...new Set(store.getPc().filter((p) => p.ma_gv === ma_gv).map((p) => p.mon))];
  return { mon: mons };
};

// ─── Lớp học ──────────────────────────────────────────────────────────────────

export const getLopHocList = async (khoi?: number): Promise<LopHoc[]> => {
  await delay();
  const list = store.getLop();
  return khoi != null ? list.filter((l) => l.khoi === khoi) : list;
};

export const getLopHocById = async (id: number): Promise<LopHoc> => {
  await delay();
  const lop = store.getLop().find((l) => l.id === id);
  if (!lop) throw new Error(`Không tìm thấy lớp: ${id}`);
  return { ...lop };
};

export const createLopHoc = async (payload: { ten_lop: string; khoi: number; gvcn?: string }): Promise<LopHoc> => {
  await delay();
  const list = store.getLop();
  const lop: LopHoc = {
    id: Math.max(0, ...list.map((l) => l.id ?? 0)) + 1,
    ...payload,
    gvcn: payload.gvcn ?? null,
  };
  store.setLop([...list, lop]);
  return { ...lop };
};

export const updateLopHoc = async (id: number, payload: Partial<LopHoc>): Promise<LopHoc> => {
  await delay();
  const list = store.getLop();
  const idx = list.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy lớp: ${id}`);
  list[idx] = { ...list[idx], ...payload };
  store.setLop(list);
  return { ...list[idx] };
};

export const deleteLopHoc = async (id: number): Promise<void> => {
  await delay();
  store.setLop(store.getLop().filter((l) => l.id !== id));
};

export const syncGvcnFromLop = async (): Promise<{ message: string }> => {
  await delay(300);
  return { message: "Đồng bộ GVCN thành công (mock)" };
};

// ─── Định mức ─────────────────────────────────────────────────────────────────

export const getDinhMucList = async (khoi?: string): Promise<DinhMuc[]> => {
  await delay();
  const list = store.getDm();
  return khoi ? list.filter((d) => d.khoi === khoi) : list;
};

export const getDanhSachMon = async (): Promise<string[]> => {
  await delay();
  return [...new Set(store.getDm().map((d) => d.mon))].sort();
};

export const createDinhMuc = async (payload: { khoi: string; mon: string; so_tiet_tuan?: number; gioi_han_buoi?: number }): Promise<DinhMuc> => {
  await delay();
  const list = store.getDm();
  const dm: DinhMuc = {
    id: Math.max(0, ...list.map((d) => d.id ?? 0)) + 1,
    khoi: payload.khoi,
    mon: payload.mon,
    so_tiet_tuan: payload.so_tiet_tuan ?? 2,
    gioi_han_buoi: payload.gioi_han_buoi ?? 1,
  };
  store.setDm([...list, dm]);
  return { ...dm };
};

export const updateDinhMuc = async (id: number, payload: Partial<DinhMuc>): Promise<DinhMuc> => {
  await delay();
  const list = store.getDm();
  const idx = list.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy định mức: ${id}`);
  list[idx] = { ...list[idx], ...payload };
  store.setDm(list);
  return { ...list[idx] };
};

export const deleteDinhMuc = async (id: number): Promise<void> => {
  await delay();
  store.setDm(store.getDm().filter((d) => d.id !== id));
};

export const updateDinhMucBulk = async (payload: DinhMuc[]): Promise<DinhMuc[]> => {
  await delay();
  store.setDm(payload);
  return store.getDm();
};

// ─── Ràng buộc ────────────────────────────────────────────────────────────────

export const getRangBuocList = async (): Promise<RangBuoc[]> => {
  await delay(); return store.getRb();
};

export const seedRangBuoc = async (): Promise<{ created: number; total_templates: number }> => {
  await delay(300);
  return { created: 0, total_templates: store.getRb().length };
};

export const createRangBuoc = async (payload: RangBuocCreatePayload): Promise<RangBuoc> => {
  await delay();
  const list = store.getRb();
  const rb: RangBuoc = {
    id: Math.max(0, ...list.map((r) => r.id)) + 1,
    rule_code: payload.rule_code ?? null,
    mo_ta: payload.mo_ta,
    loai: payload.loai,
    active: true,
    is_template: false,
    editable_params: [],
  };
  store.setRb([...list, rb]);
  return { ...rb };
};

export const updateRangBuoc = async (id: number, payload: RangBuocUpdatePayload): Promise<RangBuoc> => {
  await delay();
  const list = store.getRb();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy ràng buộc: ${id}`);
  list[idx] = { ...list[idx], ...payload };
  store.setRb(list);
  return { ...list[idx] };
};

export const deleteRangBuoc = async (id: number): Promise<void> => {
  await delay();
  store.setRb(store.getRb().filter((r) => r.id !== id));
};

export const toggleRangBuoc = async (id: number): Promise<RangBuoc> => {
  await delay();
  const list = store.getRb();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy ràng buộc: ${id}`);
  list[idx] = { ...list[idx], active: !list[idx].active };
  store.setRb(list);
  return { ...list[idx] };
};

// ─── Import ───────────────────────────────────────────────────────────────────

export interface ImportPreviewResponse {
  giao_vien: GiaoVien[];
  phan_cong: PhanCong[];
  dinh_muc: DinhMuc[];
  rang_buoc: RangBuoc[];
  errors: string[];
}

export const importPreview = async (_file: File): Promise<ImportPreviewResponse> => {
  await delay(600);
  return {
    giao_vien: MOCK_GIAO_VIEN.slice(0, 3),
    phan_cong: MOCK_PHAN_CONG.slice(0, 6),
    dinh_muc:  MOCK_DINH_MUC.slice(0, 4),
    rang_buoc: MOCK_RANG_BUOC.slice(0, 2),
    errors: [],
  };
};

export const importConfirm = async (_payload: unknown): Promise<{ success: boolean; inserted: number; updated: number; skipped: number }> => {
  await delay(800);
  return { success: true, inserted: 12, updated: 3, skipped: 1 };
};

export const truncateAllData = async (): Promise<{ success: boolean; message: string }> => {
  await delay(400);
  store.clearAll();
  return { success: true, message: "Đã xóa toàn bộ dữ liệu (mock)" };
};

// ─── TKB ──────────────────────────────────────────────────────────────────────

export const getTKBList = async (): Promise<TKBSlot[]> => {
  await delay(); return store.getTkb();
};

export const deleteAllTKB = async (): Promise<{ message: string }> => {
  await delay(300);
  store.setTkb([]);
  return { message: "Đã xóa toàn bộ TKB (mock)" };
};

export const getTKBByMaGv = async (ma_gv: string): Promise<TKBSlot[]> => {
  await delay(); return store.getTkb().filter((s) => s.ma_gv === ma_gv);
};

export const getTKBByLop = async (lop: string): Promise<TKBSlot[]> => {
  await delay(); return store.getTkb().filter((s) => s.lop === lop);
};

export const generateTKB = async (): Promise<{ job_id: string }> => {
  await delay(200);
  store.setTkb([...MOCK_TKB]);
  return { job_id: "mock-job-001" };
};

export const getTKBStatus = async (_jobId: string): Promise<{
  status: "running" | "done" | "failed"; progress: number; log: string[]; error?: string;
}> => {
  await delay(600);
  return {
    status: "done",
    progress: 100,
    log: [
      "Khởi tạo thuật toán...",
      "Phân tích ràng buộc: 5 ràng buộc (3 hard, 2 soft)",
      "Xử lý phân công: 26 phân công",
      "Tạo TKB lần 1... Score: 142",
      "Tối ưu hóa... Score: 178",
      "Hoàn thành! 60 tiết được xếp.",
    ],
  };
};

export const updateTKBSlot = async (payload: { slot: TKBSlot }): Promise<{ slot: TKBSlot; canh_bao: CanhBao[] }> => {
  await delay();
  const list = store.getTkb();
  const idx = list.findIndex((s) => s.id === payload.slot.id);
  if (idx >= 0) list[idx] = { ...payload.slot };
  store.setTkb(list);
  return { slot: { ...payload.slot }, canh_bao: [] };
};

export const swapTKBSlot = async (idA: number, idB: number): Promise<{ canh_bao: CanhBao[] }> => {
  await delay();
  const list = store.getTkb();
  const idxA = list.findIndex((s) => s.id === idA);
  const idxB = list.findIndex((s) => s.id === idB);
  if (idxA < 0 || idxB < 0) throw new Error("Slot không tồn tại");
  const a = list[idxA];
  const b = list[idxB];
  list[idxA] = { ...a, thu: b.thu, buoi: b.buoi, tiet: b.tiet };
  list[idxB] = { ...b, thu: a.thu, buoi: a.buoi, tiet: a.tiet };
  store.setTkb(list);
  return { canh_bao: [] };
};

export const validateTKB = async (): Promise<CanhBao[]> => {
  await delay(400);
  return [];
};

export const getTKBSummary = async (): Promise<{
  so_gv: number; so_lop: number; so_rang_buoc_hard: number; so_rang_buoc_soft: number; so_phan_cong: number;
}> => {
  await delay();
  return {
    so_gv: store.getGv().filter((g) => g.active).length,
    so_lop: store.getLop().length,
    so_rang_buoc_hard: store.getRb().filter((r) => r.loai === "hard" && r.active).length,
    so_rang_buoc_soft: store.getRb().filter((r) => r.loai === "soft" && r.active).length,
    so_phan_cong: store.getPc().length,
  };
};

// ─── Chat AI (mock) ────────────────────────────────────────────────────────────

export const chatWithAI = async (payload: { message: string; context?: unknown }): Promise<{
  reply: string;
  action?: "add_constraint" | "regenerate" | null;
  action_data?: { mo_ta?: string; loai?: "hard" | "soft" } | null;
}> => {
  await delay(900);
  const msg = payload.message.toLowerCase();
  const gvList = store.getGv();
  const tkbSlots = store.getTkb();
  const rbList = store.getRb();
  const activeRb = rbList.filter((r) => r.active);

  if (msg.includes("tải trọng") || msg.includes("bao nhiêu tiết") || msg.includes("số tiết")) {
    const lines = gvList.map((g) => {
      const count = tkbSlots.filter((s) => s.ma_gv === g.ma_gv).length;
      const bar = "█".repeat(Math.round(count / 2)) + "░".repeat(Math.max(0, 10 - Math.round(count / 2)));
      return `• ${g.ho_ten.split(" ").pop()}: ${bar} ${count} tiết`;
    });
    return {
      reply: `📊 Tải trọng giáo viên tuần này:\n\n${lines.join("\n")}\n\nTổng: ${tkbSlots.length} tiết · ${gvList.length} GV`,
      action: null,
    };
  }

  if (msg.includes("xung đột") || msg.includes("lỗi") || msg.includes("vi phạm") || msg.includes("sai")) {
    return {
      reply: "✅ TKB hiện tại hợp lệ!\n\nKiểm tra toàn bộ " + activeRb.length + " ràng buộc:\n" +
        activeRb.map((r) => `• ${r.loai === "hard" ? "✅" : "✨"} ${r.mo_ta}`).join("\n") +
        "\n\nKhông phát hiện vi phạm nào.",
      action: null,
    };
  }

  if ((msg.includes("ràng buộc") || msg.includes("constraint")) && !msg.includes("thêm")) {
    const hardList = activeRb.filter((r) => r.loai === "hard");
    const softList = activeRb.filter((r) => r.loai === "soft");
    return {
      reply: `📋 Đang áp dụng ${activeRb.length} ràng buộc:\n\n` +
        `🔴 Hard (${hardList.length}):\n${hardList.map((r) => `  • ${r.mo_ta}`).join("\n")}\n\n` +
        `🟡 Soft (${softList.length}):\n${softList.map((r) => `  • ${r.mo_ta}`).join("\n")}`,
      action: null,
    };
  }

  if (msg.includes("thêm") || (msg.includes("không") && (msg.includes("dạy") || msg.includes("thứ") || msg.includes("tiết")))) {
    const isSoft = msg.includes("nên") || msg.includes("ưu tiên") || msg.includes("cố gắng");
    return {
      reply: `🧠 Tôi đã phân tích: "${payload.message}"\n\nĐây là ràng buộc ${isSoft ? "mềm (soft)" : "cứng (hard)"} — sẽ ${isSoft ? "ưu tiên nhưng không bắt buộc" : "bắt buộc khi xếp TKB"}.\n\nNhấn bên dưới để thêm vào danh sách:`,
      action: "add_constraint",
      action_data: { mo_ta: payload.message, loai: isSoft ? "soft" : "hard" },
    };
  }

  if (msg.includes("tạo lại") || msg.includes("xếp lại") || msg.includes("chạy lại") || msg.includes("regenerate")) {
    return {
      reply: "🔄 Được rồi! Tôi sẽ chạy lại solver với ràng buộc hiện tại. Kết quả có thể khác đôi chút do randomization trong thuật toán tối ưu hoá.",
      action: "regenerate",
      action_data: null,
    };
  }

  const matchedGv = gvList.find((g) =>
    msg.includes(g.ho_ten.toLowerCase()) ||
    msg.includes(g.ho_ten.split(" ").pop()!.toLowerCase()) ||
    msg.includes(g.ma_gv.toLowerCase())
  );
  if (matchedGv) {
    const slots = tkbSlots.filter((s) => s.ma_gv === matchedGv.ma_gv);
    const morning = slots.filter((s) => s.buoi === "sang").length;
    const afternoon = slots.filter((s) => s.buoi === "chieu").length;
    const days = [2, 3, 4, 5, 6, 7]
      .map((t) => { const c = slots.filter((s) => s.thu === t).length; return c > 0 ? `T${t}:${c}` : null; })
      .filter(Boolean).join(" | ");
    return {
      reply: `👤 Lịch của ${matchedGv.ho_ten} (${matchedGv.ma_gv}):\n\n• Tổng: ${slots.length} tiết/tuần\n• Sáng: ${morning} tiết · Chiều: ${afternoon} tiết\n• Theo ngày: ${days}\n• Tổ: ${matchedGv.to_chuyen_mon}`,
      action: null,
    };
  }

  const classMatch = msg.match(/\b([6-9][a-c]|lớp [6-9][a-c])\b/);
  if (classMatch) {
    const lopName = classMatch[0].replace("lớp ", "").toUpperCase();
    const slots = tkbSlots.filter((s) => s.lop.toUpperCase() === lopName);
    return {
      reply: `🏫 TKB lớp ${lopName}:\n\n• Tổng: ${slots.length} tiết/tuần\n• Môn học: ${[...new Set(slots.map((s) => s.mon))].join(", ")}\n• Giáo viên: ${[...new Set(slots.map((s) => { const g = gvList.find((gv) => gv.ma_gv === s.ma_gv); return g?.ho_ten.split(" ").pop() ?? s.ma_gv; }))].join(", ")}`,
      action: null,
    };
  }

  return {
    reply: `Xin chào! Tôi có thể giúp bạn:\n\n• 📊 "Tải trọng GV" — xem số tiết/tuần từng GV\n• ❌ "Có xung đột không?" — kiểm tra vi phạm\n• 📋 "Danh sách ràng buộc" — xem đang áp dụng gì\n• ➕ "Thêm ràng buộc: [mô tả]" — thêm quy tắc mới\n• 🔄 "Tạo lại TKB" — chạy lại solver\n• 👤 Hỏi về GV hoặc lớp cụ thể\n\nHiện tại: ${tkbSlots.length} tiết đã xếp, ${activeRb.length} ràng buộc đang áp dụng.`,
    action: null,
    action_data: null,
  };
};
