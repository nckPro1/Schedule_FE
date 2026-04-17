/**
 * Mock API layer — không gọi backend.
 * Tất cả dữ liệu từ mock-data.ts, simulate async delay nhỏ.
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
  MOCK_LOP_HOC,
  MOCK_TKB,
} from "@/lib/mock-data";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

// Mutable in-memory copies (reset khi reload trang — chấp nhận được cho demo)
let gvList    = [...MOCK_GIAO_VIEN];
let pcList    = [...MOCK_PHAN_CONG];
let dmList    = [...MOCK_DINH_MUC];
let rbList    = [...MOCK_RANG_BUOC];
let lopList   = [...MOCK_LOP_HOC];
let tkbSlots  = [...MOCK_TKB];

// ─── Giáo viên ────────────────────────────────────────────────────────────────

export const getGiaoVienList = async (): Promise<GiaoVien[]> => {
  await delay(); return [...gvList];
};

export const getGiaoVienByMa = async (ma_gv: string): Promise<GiaoVien> => {
  await delay();
  const gv = gvList.find((g) => g.ma_gv === ma_gv);
  if (!gv) throw new Error(`Không tìm thấy giáo viên: ${ma_gv}`);
  return { ...gv };
};

export const createGiaoVien = async (payload: Partial<GiaoVien>): Promise<GiaoVien> => {
  await delay();
  const newGv: GiaoVien = {
    id: Math.max(0, ...gvList.map((g) => g.id)) + 1,
    ma_gv: payload.ma_gv ?? `GV${String(gvList.length + 1).padStart(3, "0")}`,
    ho_ten: payload.ho_ten ?? "",
    to_chuyen_mon: payload.to_chuyen_mon ?? "",
    chuc_vu: payload.chuc_vu ?? null,
    lop_chu_nhiem: payload.lop_chu_nhiem ?? null,
    active: payload.active ?? true,
    tong_tiet: payload.tong_tiet ?? 0,
  };
  gvList.push(newGv);
  return { ...newGv };
};

export const createGiaoVienBulk = async (
  items: Array<{ ma_gv?: string; ho_ten: string; to_chuyen_mon?: string; chuc_vu?: string; lop_chu_nhiem?: string }>
): Promise<GiaoVien[]> => {
  await delay();
  const created: GiaoVien[] = items.map((item, i) => ({
    id: Math.max(0, ...gvList.map((g) => g.id)) + i + 1,
    ma_gv: item.ma_gv ?? `GV${String(gvList.length + i + 1).padStart(3, "0")}`,
    ho_ten: item.ho_ten,
    to_chuyen_mon: item.to_chuyen_mon ?? "",
    chuc_vu: item.chuc_vu ?? null,
    lop_chu_nhiem: item.lop_chu_nhiem ?? null,
    active: true,
    tong_tiet: 0,
  }));
  gvList.push(...created);
  return created.map((g) => ({ ...g }));
};

export const updateGiaoVien = async (ma_gv: string, payload: Partial<GiaoVien>): Promise<GiaoVien> => {
  await delay();
  const idx = gvList.findIndex((g) => g.ma_gv === ma_gv);
  if (idx < 0) throw new Error(`Không tìm thấy giáo viên: ${ma_gv}`);
  gvList[idx] = { ...gvList[idx], ...payload };
  return { ...gvList[idx] };
};

export const deleteGiaoVien = async (ma_gv: string): Promise<void> => {
  await delay();
  gvList = gvList.filter((g) => g.ma_gv !== ma_gv);
};

// ─── Phân công ────────────────────────────────────────────────────────────────

export const getPhanCongList = async (): Promise<PhanCong[]> => {
  await delay(); return [...pcList];
};

export const getPhanCongByMaGv = async (ma_gv: string): Promise<PhanCong[]> => {
  await delay(); return pcList.filter((p) => p.ma_gv === ma_gv);
};

export const createPhanCong = async (payload: Partial<PhanCong>): Promise<PhanCong> => {
  await delay();
  const pc: PhanCong = {
    id: Math.max(0, ...pcList.map((p) => p.id)) + 1,
    ma_gv: payload.ma_gv ?? "",
    lop: payload.lop ?? "",
    mon: payload.mon ?? "",
    so_tiet_tuan: payload.so_tiet_tuan ?? 2,
  };
  pcList.push(pc);
  return { ...pc };
};

export const createPhanCongBulk = async (
  items: Array<{ ma_gv: string; lop: string; mon: string; so_tiet_tuan: number }>
): Promise<PhanCong[]> => {
  await delay();
  const created: PhanCong[] = items.map((item, i) => ({
    id: Math.max(0, ...pcList.map((p) => p.id)) + i + 1,
    ...item,
  }));
  pcList.push(...created);
  return created.map((p) => ({ ...p }));
};

export const updatePhanCong = async (id: number, payload: Partial<PhanCong>): Promise<PhanCong> => {
  await delay();
  const idx = pcList.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy phân công: ${id}`);
  pcList[idx] = { ...pcList[idx], ...payload };
  return { ...pcList[idx] };
};

export const deletePhanCong = async (id: number): Promise<void> => {
  await delay();
  pcList = pcList.filter((p) => p.id !== id);
};

export const getMonChoGv = async (ma_gv: string): Promise<{ mon: string[] }> => {
  await delay();
  const mons = [...new Set(pcList.filter((p) => p.ma_gv === ma_gv).map((p) => p.mon))];
  return { mon: mons };
};

// ─── Lớp học ──────────────────────────────────────────────────────────────────

export const getLopHocList = async (khoi?: number): Promise<LopHoc[]> => {
  await delay();
  return khoi != null ? lopList.filter((l) => l.khoi === khoi) : [...lopList];
};

export const getLopHocById = async (id: number): Promise<LopHoc> => {
  await delay();
  const lop = lopList.find((l) => l.id === id);
  if (!lop) throw new Error(`Không tìm thấy lớp: ${id}`);
  return { ...lop };
};

export const createLopHoc = async (payload: { ten_lop: string; khoi: number; gvcn?: string }): Promise<LopHoc> => {
  await delay();
  const lop: LopHoc = {
    id: Math.max(0, ...lopList.map((l) => l.id ?? 0)) + 1,
    ...payload,
    gvcn: payload.gvcn ?? null,
  };
  lopList.push(lop);
  return { ...lop };
};

export const updateLopHoc = async (id: number, payload: Partial<LopHoc>): Promise<LopHoc> => {
  await delay();
  const idx = lopList.findIndex((l) => l.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy lớp: ${id}`);
  lopList[idx] = { ...lopList[idx], ...payload };
  return { ...lopList[idx] };
};

export const deleteLopHoc = async (id: number): Promise<void> => {
  await delay();
  lopList = lopList.filter((l) => l.id !== id);
};

export const syncGvcnFromLop = async (): Promise<{ message: string }> => {
  await delay(300);
  return { message: "Đồng bộ GVCN thành công (mock)" };
};

// ─── Định mức ─────────────────────────────────────────────────────────────────

export const getDinhMucList = async (khoi?: string): Promise<DinhMuc[]> => {
  await delay();
  return khoi ? dmList.filter((d) => d.khoi === khoi) : [...dmList];
};

export const getDanhSachMon = async (): Promise<string[]> => {
  await delay();
  return [...new Set(dmList.map((d) => d.mon))].sort();
};

export const createDinhMuc = async (payload: { khoi: string; mon: string; so_tiet_tuan?: number; gioi_han_buoi?: number }): Promise<DinhMuc> => {
  await delay();
  const dm: DinhMuc = {
    id: Math.max(0, ...dmList.map((d) => d.id ?? 0)) + 1,
    khoi: payload.khoi,
    mon: payload.mon,
    so_tiet_tuan: payload.so_tiet_tuan ?? 2,
    gioi_han_buoi: payload.gioi_han_buoi ?? 1,
  };
  dmList.push(dm);
  return { ...dm };
};

export const updateDinhMuc = async (id: number, payload: Partial<DinhMuc>): Promise<DinhMuc> => {
  await delay();
  const idx = dmList.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy định mức: ${id}`);
  dmList[idx] = { ...dmList[idx], ...payload };
  return { ...dmList[idx] };
};

export const deleteDinhMuc = async (id: number): Promise<void> => {
  await delay();
  dmList = dmList.filter((d) => d.id !== id);
};

export const updateDinhMucBulk = async (payload: DinhMuc[]): Promise<DinhMuc[]> => {
  await delay();
  dmList = payload;
  return [...dmList];
};

// ─── Ràng buộc ────────────────────────────────────────────────────────────────

export const getRangBuocList = async (): Promise<RangBuoc[]> => {
  await delay(); return [...rbList];
};

export const seedRangBuoc = async (): Promise<{ created: number; total_templates: number }> => {
  await delay(300);
  return { created: 0, total_templates: rbList.length };
};

export const createRangBuoc = async (payload: RangBuocCreatePayload): Promise<RangBuoc> => {
  await delay();
  const rb: RangBuoc = {
    id: Math.max(0, ...rbList.map((r) => r.id)) + 1,
    rule_code: payload.rule_code ?? null,
    mo_ta: payload.mo_ta,
    loai: payload.loai,
    active: true,
    is_template: false,
    editable_params: [],
  };
  rbList.push(rb);
  return { ...rb };
};

export const updateRangBuoc = async (id: number, payload: RangBuocUpdatePayload): Promise<RangBuoc> => {
  await delay();
  const idx = rbList.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy ràng buộc: ${id}`);
  rbList[idx] = { ...rbList[idx], ...payload };
  return { ...rbList[idx] };
};

export const deleteRangBuoc = async (id: number): Promise<void> => {
  await delay();
  rbList = rbList.filter((r) => r.id !== id);
};

export const toggleRangBuoc = async (id: number): Promise<RangBuoc> => {
  await delay();
  const idx = rbList.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`Không tìm thấy ràng buộc: ${id}`);
  rbList[idx] = { ...rbList[idx], active: !rbList[idx].active };
  return { ...rbList[idx] };
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
  gvList = []; pcList = []; dmList = []; rbList = []; lopList = []; tkbSlots = [];
  return { success: true, message: "Đã xóa toàn bộ dữ liệu (mock)" };
};

// ─── TKB ──────────────────────────────────────────────────────────────────────

export const getTKBList = async (): Promise<TKBSlot[]> => {
  await delay(); return [...tkbSlots];
};

export const deleteAllTKB = async (): Promise<{ message: string }> => {
  await delay(300);
  tkbSlots = [];
  return { message: "Đã xóa toàn bộ TKB (mock)" };
};

export const getTKBByMaGv = async (ma_gv: string): Promise<TKBSlot[]> => {
  await delay(); return tkbSlots.filter((s) => s.ma_gv === ma_gv);
};

export const getTKBByLop = async (lop: string): Promise<TKBSlot[]> => {
  await delay(); return tkbSlots.filter((s) => s.lop === lop);
};

export const generateTKB = async (): Promise<{ job_id: string }> => {
  await delay(200);
  // Simulate restore mock data
  tkbSlots = [...MOCK_TKB];
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
  const idx = tkbSlots.findIndex((s) => s.id === payload.slot.id);
  if (idx >= 0) tkbSlots[idx] = { ...payload.slot };
  return { slot: { ...payload.slot }, canh_bao: [] };
};

export const swapTKBSlot = async (idA: number, idB: number): Promise<{ canh_bao: CanhBao[] }> => {
  await delay();
  const a = tkbSlots.find((s) => s.id === idA);
  const b = tkbSlots.find((s) => s.id === idB);
  if (!a || !b) throw new Error("Slot không tồn tại");
  const idxA = tkbSlots.findIndex((s) => s.id === idA);
  const idxB = tkbSlots.findIndex((s) => s.id === idB);
  const { thu: tA, buoi: bA, tiet: tiA } = a;
  tkbSlots[idxA] = { ...a, thu: b.thu, buoi: b.buoi, tiet: b.tiet };
  tkbSlots[idxB] = { ...b, thu: tA, buoi: bA, tiet: tiA };
  return { canh_bao: [] };
};

export const validateTKB = async (): Promise<CanhBao[]> => {
  await delay(400);
  return []; // Mock: TKB hợp lệ
};

export const getTKBSummary = async (): Promise<{
  so_gv: number; so_lop: number; so_rang_buoc_hard: number; so_rang_buoc_soft: number; so_phan_cong: number;
}> => {
  await delay();
  return {
    so_gv: gvList.filter((g) => g.active).length,
    so_lop: lopList.length,
    so_rang_buoc_hard: rbList.filter((r) => r.loai === "hard" && r.active).length,
    so_rang_buoc_soft: rbList.filter((r) => r.loai === "soft" && r.active).length,
    so_phan_cong: pcList.length,
  };
};

// ─── Chat AI (mock — phản hồi thông minh hơn) ─────────────────────────────────

export const chatWithAI = async (payload: { message: string; context?: unknown }): Promise<{
  reply: string;
  action?: "add_constraint" | "regenerate" | null;
  action_data?: { mo_ta?: string; loai?: "hard" | "soft" } | null;
}> => {
  await delay(900);
  const msg = payload.message.toLowerCase();
  const activeRb = rbList.filter((r) => r.active);

  // Tải trọng GV
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

  // Xung đột / lỗi
  if (msg.includes("xung đột") || msg.includes("lỗi") || msg.includes("vi phạm") || msg.includes("sai")) {
    return {
      reply: "✅ TKB hiện tại hợp lệ!\n\nKiểm tra toàn bộ " + activeRb.length + " ràng buộc:\n" +
        activeRb.map((r) => `• ${r.loai === "hard" ? "✅" : "✨"} ${r.mo_ta}`).join("\n") +
        "\n\nKhông phát hiện vi phạm nào.",
      action: null,
    };
  }

  // Danh sách ràng buộc
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

  // Thêm ràng buộc
  if (msg.includes("thêm") || (msg.includes("không") && (msg.includes("dạy") || msg.includes("thứ") || msg.includes("tiết")))) {
    const isSoft = msg.includes("nên") || msg.includes("ưu tiên") || msg.includes("cố gắng");
    return {
      reply: `🧠 Tôi đã phân tích: "${payload.message}"\n\nĐây là ràng buộc ${isSoft ? "mềm (soft)" : "cứng (hard)"} — sẽ ${isSoft ? "ưu tiên nhưng không bắt buộc" : "bắt buộc khi xếp TKB"}.\n\nNhấn bên dưới để thêm vào danh sách:`,
      action: "add_constraint",
      action_data: { mo_ta: payload.message, loai: isSoft ? "soft" : "hard" },
    };
  }

  // Tạo lại
  if (msg.includes("tạo lại") || msg.includes("xếp lại") || msg.includes("chạy lại") || msg.includes("regenerate")) {
    return {
      reply: "🔄 Được rồi! Tôi sẽ chạy lại solver với ràng buộc hiện tại. Kết quả có thể khác đôi chút do randomization trong thuật toán tối ưu hoá.",
      action: "regenerate",
      action_data: null,
    };
  }

  // Hỏi về GV cụ thể
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

  // Hỏi về lớp cụ thể
  const classMatch = msg.match(/\b([6-9][a-c]|lớp [6-9][a-c])\b/);
  if (classMatch) {
    const lopName = classMatch[0].replace("lớp ", "").toUpperCase();
    const slots = tkbSlots.filter((s) => s.lop.toUpperCase() === lopName);
    return {
      reply: `🏫 TKB lớp ${lopName}:\n\n• Tổng: ${slots.length} tiết/tuần\n• Môn học: ${[...new Set(slots.map((s) => s.mon))].join(", ")}\n• Giáo viên: ${[...new Set(slots.map((s) => { const g = gvList.find((gv) => gv.ma_gv === s.ma_gv); return g?.ho_ten.split(" ").pop() ?? s.ma_gv; }))].join(", ")}`,
      action: null,
    };
  }

  // Default
  return {
    reply: `Xin chào! Tôi có thể giúp bạn:\n\n• 📊 "Tải trọng GV" — xem số tiết/tuần từng GV\n• ❌ "Có xung đột không?" — kiểm tra vi phạm\n• 📋 "Danh sách ràng buộc" — xem đang áp dụng gì\n• ➕ "Thêm ràng buộc: [mô tả]" — thêm quy tắc mới\n• 🔄 "Tạo lại TKB" — chạy lại solver\n• 👤 Hỏi về GV hoặc lớp cụ thể\n\nHiện tại: ${tkbSlots.length} tiết đã xếp, ${activeRb.length} ràng buộc đang áp dụng.`,
    action: null,
    action_data: null,
  };
};
