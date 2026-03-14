import type { CanhBao, GiaoVien, LopHoc, PhanCong, RangBuoc, TKBSlot } from "@/lib/types";

// ============================================================
// GIÁO VIÊN (12 GV, đủ các tổ)
// ============================================================
export const giaoVienMock: GiaoVien[] = [
  // Tổ Toán - Tin
  { id: 1,  ma_gv: "kiennc",  ho_ten: "Nguyễn Công Kiên",   to_chuyen_mon: "Toán - Tin",   chuc_vu: "TTCM", so_tiet_chuan: 17, lop_chu_nhiem: "9/3", active: true },
  { id: 2,  ma_gv: "lanhtm",  ho_ten: "Trần Thị Mỹ Lan",    to_chuyen_mon: "Toán - Tin",   chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "8/2", active: true },
  { id: 3,  ma_gv: "tungbv",  ho_ten: "Bùi Văn Tùng",       to_chuyen_mon: "Toán - Tin",   chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "7/1", active: true },
  // Tổ Ngữ Văn
  { id: 4,  ma_gv: "phucdq",  ho_ten: "Đặng Quốc Phúc",     to_chuyen_mon: "Ngữ Văn",      chuc_vu: "TTCM", so_tiet_chuan: 17, lop_chu_nhiem: "8/5", active: true },
  { id: 5,  ma_gv: "anhtn",   ho_ten: "Trần Ngọc Anh",       to_chuyen_mon: "Ngữ Văn",      chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "6/2", active: true },
  { id: 6,  ma_gv: "hoanglv", ho_ten: "Lê Văn Hoàng",        to_chuyen_mon: "Ngữ Văn",      chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "7/3", active: true },
  // Tổ Tiếng Anh
  { id: 7,  ma_gv: "minhpt",  ho_ten: "Phạm Tuấn Minh",      to_chuyen_mon: "Tiếng Anh",    chuc_vu: "PHT",  so_tiet_chuan: 16, lop_chu_nhiem: null,  active: true },
  { id: 8,  ma_gv: "thuynt",  ho_ten: "Nguyễn Thị Thùy",     to_chuyen_mon: "Tiếng Anh",    chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "6/4", active: true },
  // Tổ KHTN
  { id: 9,  ma_gv: "namtv",   ho_ten: "Trần Văn Nam",         to_chuyen_mon: "KHTN",         chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "8/1", active: true },
  { id: 10, ma_gv: "lienhtt", ho_ten: "Huỳnh Thị Thanh Liên",to_chuyen_mon: "KHTN",         chuc_vu: null,   so_tiet_chuan: 19, lop_chu_nhiem: "9/1", active: true },
  // Tổ Sử - Địa - GDCD
  { id: 11, ma_gv: "quynhlt", ho_ten: "Lê Thị Quỳnh",         to_chuyen_mon: "Sử - Địa - GDCD", chuc_vu: null, so_tiet_chuan: 19, lop_chu_nhiem: "6/1", active: true },
  { id: 12, ma_gv: "ducnm",   ho_ten: "Nguyễn Minh Đức",      to_chuyen_mon: "Sử - Địa - GDCD", chuc_vu: null, so_tiet_chuan: 19, lop_chu_nhiem: "7/5", active: true },
];

// ============================================================
// PHÂN CÔNG (mỗi GV dạy đúng môn, đúng lớp)
// ============================================================
export const phanCongMock: PhanCong[] = [
  // kiennc - Toán khối 9
  { id: 1,  ma_gv: "kiennc",  lop: "9/3", mon: "Toán", so_tiet_tuan: 4 },
  { id: 2,  ma_gv: "kiennc",  lop: "9/4", mon: "Toán", so_tiet_tuan: 4 },
  { id: 3,  ma_gv: "kiennc",  lop: "9/5", mon: "Toán", so_tiet_tuan: 4 },
  // lanhtm - Toán khối 8
  { id: 4,  ma_gv: "lanhtm",  lop: "8/1", mon: "Toán", so_tiet_tuan: 4 },
  { id: 5,  ma_gv: "lanhtm",  lop: "8/2", mon: "Toán", so_tiet_tuan: 4 },
  { id: 6,  ma_gv: "lanhtm",  lop: "8/3", mon: "Toán", so_tiet_tuan: 4 },
  // tungbv - Toán khối 6 & 7
  { id: 7,  ma_gv: "tungbv",  lop: "6/1", mon: "Toán", so_tiet_tuan: 4 },
  { id: 8,  ma_gv: "tungbv",  lop: "6/2", mon: "Toán", so_tiet_tuan: 4 },
  { id: 9,  ma_gv: "tungbv",  lop: "7/1", mon: "Toán", so_tiet_tuan: 4 },
  // phucdq - Văn khối 8
  { id: 10, ma_gv: "phucdq",  lop: "8/4", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id: 11, ma_gv: "phucdq",  lop: "8/5", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id: 12, ma_gv: "phucdq",  lop: "9/1", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  // anhtn - Văn khối 6
  { id: 13, ma_gv: "anhtn",   lop: "6/1", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id: 14, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id: 15, ma_gv: "anhtn",   lop: "6/3", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  // hoanglv - Văn khối 7
  { id: 16, ma_gv: "hoanglv", lop: "7/1", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id: 17, ma_gv: "hoanglv", lop: "7/2", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id: 18, ma_gv: "hoanglv", lop: "7/3", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  // minhpt - Anh khối 9
  { id: 19, ma_gv: "minhpt",  lop: "9/1", mon: "Tiếng Anh", so_tiet_tuan: 3 },
  { id: 20, ma_gv: "minhpt",  lop: "9/2", mon: "Tiếng Anh", so_tiet_tuan: 3 },
  { id: 21, ma_gv: "minhpt",  lop: "9/3", mon: "Tiếng Anh", so_tiet_tuan: 3 },
  // thuynt - Anh khối 6 & 7
  { id: 22, ma_gv: "thuynt",  lop: "6/1", mon: "Tiếng Anh", so_tiet_tuan: 3 },
  { id: 23, ma_gv: "thuynt",  lop: "6/2", mon: "Tiếng Anh", so_tiet_tuan: 3 },
  { id: 24, ma_gv: "thuynt",  lop: "7/1", mon: "Tiếng Anh", so_tiet_tuan: 3 },
  // namtv - KHTN khối 8
  { id: 25, ma_gv: "namtv",   lop: "8/1", mon: "KHTN", so_tiet_tuan: 4 },
  { id: 26, ma_gv: "namtv",   lop: "8/2", mon: "KHTN", so_tiet_tuan: 4 },
  // lienhtt - KHTN khối 9
  { id: 27, ma_gv: "lienhtt", lop: "9/1", mon: "KHTN", so_tiet_tuan: 4 },
  { id: 28, ma_gv: "lienhtt", lop: "9/2", mon: "KHTN", so_tiet_tuan: 4 },
  // quynhlt - Lịch Sử + Địa Lý khối 6
  { id: 29, ma_gv: "quynhlt", lop: "6/1", mon: "Lịch Sử",  so_tiet_tuan: 2 },
  { id: 30, ma_gv: "quynhlt", lop: "6/1", mon: "Địa Lý",   so_tiet_tuan: 2 },
  { id: 31, ma_gv: "quynhlt", lop: "6/2", mon: "Lịch Sử",  so_tiet_tuan: 2 },
  // ducnm - Lịch Sử + GDCD khối 7
  { id: 32, ma_gv: "ducnm",   lop: "7/1", mon: "Lịch Sử",  so_tiet_tuan: 2 },
  { id: 33, ma_gv: "ducnm",   lop: "7/1", mon: "GDCD",     so_tiet_tuan: 1 },
  { id: 34, ma_gv: "ducnm",   lop: "7/5", mon: "Lịch Sử",  so_tiet_tuan: 2 },
];

// ============================================================
// TKB MOCK — Quy tắc:
//   Khối 6, 7 → học CHIỀU (buoi: "chieu"), T2–T6, 5 tiết/ngày
//   Khối 8, 9 → học SÁNG  (buoi: "sang"),  T2–T6, 5 tiết/ngày
// ============================================================
export const tkbMock: TKBSlot[] = [

  // ══════════════════════════════════════════════════════════
  // LỚP 6/1 — Chiều T2, T3, T4
  // ══════════════════════════════════════════════════════════
  { thu: 2, buoi: "chieu", tiet: 1, ma_gv: "tungbv",  lop: "6/1", mon: "Toán" },
  { thu: 2, buoi: "chieu", tiet: 2, ma_gv: "tungbv",  lop: "6/1", mon: "Toán" },
  { thu: 2, buoi: "chieu", tiet: 3, ma_gv: "anhtn",   lop: "6/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "chieu", tiet: 4, ma_gv: "anhtn",   lop: "6/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "chieu", tiet: 5, ma_gv: "thuynt",  lop: "6/1", mon: "Tiếng Anh" },

  { thu: 3, buoi: "chieu", tiet: 1, ma_gv: "tungbv",  lop: "6/1", mon: "Toán" },
  { thu: 3, buoi: "chieu", tiet: 2, ma_gv: "tungbv",  lop: "6/1", mon: "Toán" },
  { thu: 3, buoi: "chieu", tiet: 3, ma_gv: "anhtn",   lop: "6/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "chieu", tiet: 4, ma_gv: "anhtn",   lop: "6/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "chieu", tiet: 5, ma_gv: "thuynt",  lop: "6/1", mon: "Tiếng Anh" },

  { thu: 4, buoi: "chieu", tiet: 1, ma_gv: "thuynt",  lop: "6/1", mon: "Tiếng Anh" },
  { thu: 4, buoi: "chieu", tiet: 2, ma_gv: "quynhlt", lop: "6/1", mon: "Lịch Sử" },
  { thu: 4, buoi: "chieu", tiet: 3, ma_gv: "quynhlt", lop: "6/1", mon: "Lịch Sử" },
  { thu: 4, buoi: "chieu", tiet: 4, ma_gv: "quynhlt", lop: "6/1", mon: "Địa Lý" },
  { thu: 4, buoi: "chieu", tiet: 5, ma_gv: "quynhlt", lop: "6/1", mon: "Địa Lý" },

  // ══════════════════════════════════════════════════════════
  // LỚP 6/2 — Chiều T2, T4, T5
  // ══════════════════════════════════════════════════════════
  { thu: 2, buoi: "chieu", tiet: 1, ma_gv: "tungbv",  lop: "6/2", mon: "Toán" },
  { thu: 2, buoi: "chieu", tiet: 2, ma_gv: "tungbv",  lop: "6/2", mon: "Toán" },
  { thu: 2, buoi: "chieu", tiet: 3, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn" },
  { thu: 2, buoi: "chieu", tiet: 4, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn" },
  { thu: 2, buoi: "chieu", tiet: 5, ma_gv: "thuynt",  lop: "6/2", mon: "Tiếng Anh" },

  { thu: 4, buoi: "chieu", tiet: 1, ma_gv: "tungbv",  lop: "6/2", mon: "Toán" },
  { thu: 4, buoi: "chieu", tiet: 2, ma_gv: "tungbv",  lop: "6/2", mon: "Toán" },
  { thu: 4, buoi: "chieu", tiet: 3, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn" },
  { thu: 4, buoi: "chieu", tiet: 4, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn" },
  { thu: 4, buoi: "chieu", tiet: 5, ma_gv: "thuynt",  lop: "6/2", mon: "Tiếng Anh" },

  { thu: 5, buoi: "chieu", tiet: 1, ma_gv: "thuynt",  lop: "6/2", mon: "Tiếng Anh" },
  { thu: 5, buoi: "chieu", tiet: 2, ma_gv: "quynhlt", lop: "6/2", mon: "Lịch Sử" },
  { thu: 5, buoi: "chieu", tiet: 3, ma_gv: "quynhlt", lop: "6/2", mon: "Lịch Sử" },
  { thu: 5, buoi: "chieu", tiet: 4, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn" },
  { thu: 5, buoi: "chieu", tiet: 5, ma_gv: "anhtn",   lop: "6/2", mon: "Ngữ Văn" },

  // ══════════════════════════════════════════════════════════
  // LỚP 7/1 — Chiều T2, T3, T5
  // ══════════════════════════════════════════════════════════
  { thu: 2, buoi: "chieu", tiet: 1, ma_gv: "tungbv",  lop: "7/1", mon: "Toán" },
  { thu: 2, buoi: "chieu", tiet: 2, ma_gv: "tungbv",  lop: "7/1", mon: "Toán" },
  { thu: 2, buoi: "chieu", tiet: 3, ma_gv: "hoanglv", lop: "7/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "chieu", tiet: 4, ma_gv: "hoanglv", lop: "7/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "chieu", tiet: 5, ma_gv: "thuynt",  lop: "7/1", mon: "Tiếng Anh" },

  { thu: 3, buoi: "chieu", tiet: 1, ma_gv: "tungbv",  lop: "7/1", mon: "Toán" },
  { thu: 3, buoi: "chieu", tiet: 2, ma_gv: "tungbv",  lop: "7/1", mon: "Toán" },
  { thu: 3, buoi: "chieu", tiet: 3, ma_gv: "hoanglv", lop: "7/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "chieu", tiet: 4, ma_gv: "hoanglv", lop: "7/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "chieu", tiet: 5, ma_gv: "thuynt",  lop: "7/1", mon: "Tiếng Anh" },

  { thu: 5, buoi: "chieu", tiet: 1, ma_gv: "thuynt",  lop: "7/1", mon: "Tiếng Anh" },
  { thu: 5, buoi: "chieu", tiet: 2, ma_gv: "ducnm",   lop: "7/1", mon: "Lịch Sử" },
  { thu: 5, buoi: "chieu", tiet: 3, ma_gv: "ducnm",   lop: "7/1", mon: "Lịch Sử" },
  { thu: 5, buoi: "chieu", tiet: 4, ma_gv: "ducnm",   lop: "7/1", mon: "GDCD" },
  { thu: 5, buoi: "chieu", tiet: 5, ma_gv: "hoanglv", lop: "7/1", mon: "Ngữ Văn" },

  // ══════════════════════════════════════════════════════════
  // LỚP 8/1 — Sáng T2, T3, T4
  // ══════════════════════════════════════════════════════════
  { thu: 2, buoi: "sang", tiet: 1, ma_gv: "lanhtm", lop: "8/1", mon: "Toán" },
  { thu: 2, buoi: "sang", tiet: 2, ma_gv: "lanhtm", lop: "8/1", mon: "Toán" },
  { thu: 2, buoi: "sang", tiet: 3, ma_gv: "phucdq", lop: "8/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "sang", tiet: 4, ma_gv: "phucdq", lop: "8/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "sang", tiet: 5, ma_gv: "namtv",  lop: "8/1", mon: "KHTN" },

  { thu: 3, buoi: "sang", tiet: 1, ma_gv: "lanhtm", lop: "8/1", mon: "Toán" },
  { thu: 3, buoi: "sang", tiet: 2, ma_gv: "lanhtm", lop: "8/1", mon: "Toán" },
  { thu: 3, buoi: "sang", tiet: 3, ma_gv: "phucdq", lop: "8/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "sang", tiet: 4, ma_gv: "phucdq", lop: "8/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "sang", tiet: 5, ma_gv: "namtv",  lop: "8/1", mon: "KHTN" },

  { thu: 4, buoi: "sang", tiet: 1, ma_gv: "namtv",  lop: "8/1", mon: "KHTN" },
  { thu: 4, buoi: "sang", tiet: 2, ma_gv: "namtv",  lop: "8/1", mon: "KHTN" },
  { thu: 4, buoi: "sang", tiet: 3, ma_gv: "minhpt", lop: "8/1", mon: "Tiếng Anh" },
  { thu: 4, buoi: "sang", tiet: 4, ma_gv: "minhpt", lop: "8/1", mon: "Tiếng Anh" },
  { thu: 4, buoi: "sang", tiet: 5, ma_gv: "minhpt", lop: "8/1", mon: "Tiếng Anh" },

  // ══════════════════════════════════════════════════════════
  // LỚP 8/2 — Sáng T2, T4, T6
  // ══════════════════════════════════════════════════════════
  { thu: 2, buoi: "sang", tiet: 1, ma_gv: "lanhtm",  lop: "8/2", mon: "Toán" },
  { thu: 2, buoi: "sang", tiet: 2, ma_gv: "lanhtm",  lop: "8/2", mon: "Toán" },
  { thu: 2, buoi: "sang", tiet: 3, ma_gv: "namtv",   lop: "8/2", mon: "KHTN" },
  { thu: 2, buoi: "sang", tiet: 4, ma_gv: "namtv",   lop: "8/2", mon: "KHTN" },
  { thu: 2, buoi: "sang", tiet: 5, ma_gv: "hoanglv", lop: "8/2", mon: "Ngữ Văn" },

  { thu: 4, buoi: "sang", tiet: 1, ma_gv: "lanhtm",  lop: "8/2", mon: "Toán" },
  { thu: 4, buoi: "sang", tiet: 2, ma_gv: "lanhtm",  lop: "8/2", mon: "Toán" },
  { thu: 4, buoi: "sang", tiet: 3, ma_gv: "namtv",   lop: "8/2", mon: "KHTN" },
  { thu: 4, buoi: "sang", tiet: 4, ma_gv: "namtv",   lop: "8/2", mon: "KHTN" },
  { thu: 4, buoi: "sang", tiet: 5, ma_gv: "hoanglv", lop: "8/2", mon: "Ngữ Văn" },

  { thu: 6, buoi: "sang", tiet: 1, ma_gv: "hoanglv", lop: "8/2", mon: "Ngữ Văn" },
  { thu: 6, buoi: "sang", tiet: 2, ma_gv: "hoanglv", lop: "8/2", mon: "Ngữ Văn" },
  { thu: 6, buoi: "sang", tiet: 3, ma_gv: "minhpt",  lop: "8/2", mon: "Tiếng Anh" },
  { thu: 6, buoi: "sang", tiet: 4, ma_gv: "minhpt",  lop: "8/2", mon: "Tiếng Anh" },
  { thu: 6, buoi: "sang", tiet: 5, ma_gv: "minhpt",  lop: "8/2", mon: "Tiếng Anh" },

  // ══════════════════════════════════════════════════════════
  // LỚP 9/1 — Sáng T2, T3, T5
  // ══════════════════════════════════════════════════════════
  { thu: 2, buoi: "sang", tiet: 1, ma_gv: "phucdq",  lop: "9/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "sang", tiet: 2, ma_gv: "phucdq",  lop: "9/1", mon: "Ngữ Văn" },
  { thu: 2, buoi: "sang", tiet: 3, ma_gv: "lienhtt", lop: "9/1", mon: "KHTN" },
  { thu: 2, buoi: "sang", tiet: 4, ma_gv: "lienhtt", lop: "9/1", mon: "KHTN" },
  { thu: 2, buoi: "sang", tiet: 5, ma_gv: "minhpt",  lop: "9/1", mon: "Tiếng Anh" },

  { thu: 3, buoi: "sang", tiet: 1, ma_gv: "phucdq",  lop: "9/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "sang", tiet: 2, ma_gv: "phucdq",  lop: "9/1", mon: "Ngữ Văn" },
  { thu: 3, buoi: "sang", tiet: 3, ma_gv: "lienhtt", lop: "9/1", mon: "KHTN" },
  { thu: 3, buoi: "sang", tiet: 4, ma_gv: "lienhtt", lop: "9/1", mon: "KHTN" },
  { thu: 3, buoi: "sang", tiet: 5, ma_gv: "minhpt",  lop: "9/1", mon: "Tiếng Anh" },

  { thu: 5, buoi: "sang", tiet: 1, ma_gv: "minhpt",  lop: "9/1", mon: "Tiếng Anh" },
  { thu: 5, buoi: "sang", tiet: 2, ma_gv: "kiennc",  lop: "9/1", mon: "Toán" },
  { thu: 5, buoi: "sang", tiet: 3, ma_gv: "kiennc",  lop: "9/1", mon: "Toán" },
  { thu: 5, buoi: "sang", tiet: 4, ma_gv: "kiennc",  lop: "9/1", mon: "Toán" },
  { thu: 5, buoi: "sang", tiet: 5, ma_gv: "kiennc",  lop: "9/1", mon: "Toán" },

  // ══════════════════════════════════════════════════════════
  // LỚP 9/3 — Sáng T3, T4, T6
  // ══════════════════════════════════════════════════════════
  { thu: 3, buoi: "sang", tiet: 1, ma_gv: "kiennc",  lop: "9/3", mon: "Toán" },
  { thu: 3, buoi: "sang", tiet: 2, ma_gv: "kiennc",  lop: "9/3", mon: "Toán" },
  { thu: 3, buoi: "sang", tiet: 3, ma_gv: "phucdq",  lop: "9/3", mon: "Ngữ Văn" },
  { thu: 3, buoi: "sang", tiet: 4, ma_gv: "phucdq",  lop: "9/3", mon: "Ngữ Văn" },
  { thu: 3, buoi: "sang", tiet: 5, ma_gv: "minhpt",  lop: "9/3", mon: "Tiếng Anh" },

  { thu: 4, buoi: "sang", tiet: 1, ma_gv: "kiennc",  lop: "9/3", mon: "Toán" },
  { thu: 4, buoi: "sang", tiet: 2, ma_gv: "kiennc",  lop: "9/3", mon: "Toán" },
  { thu: 4, buoi: "sang", tiet: 3, ma_gv: "phucdq",  lop: "9/3", mon: "Ngữ Văn" },
  { thu: 4, buoi: "sang", tiet: 4, ma_gv: "phucdq",  lop: "9/3", mon: "Ngữ Văn" },
  { thu: 4, buoi: "sang", tiet: 5, ma_gv: "minhpt",  lop: "9/3", mon: "Tiếng Anh" },

  { thu: 6, buoi: "sang", tiet: 1, ma_gv: "minhpt",  lop: "9/3", mon: "Tiếng Anh" },
  { thu: 6, buoi: "sang", tiet: 2, ma_gv: "lienhtt", lop: "9/3", mon: "KHTN" },
  { thu: 6, buoi: "sang", tiet: 3, ma_gv: "lienhtt", lop: "9/3", mon: "KHTN" },
  { thu: 6, buoi: "sang", tiet: 4, ma_gv: "lienhtt", lop: "9/3", mon: "KHTN" },
  { thu: 6, buoi: "sang", tiet: 5, ma_gv: "lienhtt", lop: "9/3", mon: "KHTN" },
];

export const canhBaoMock: CanhBao[] = [
  {
    loai: "soft",
    ma_gv: "phucdq",
    mo_ta: "Giáo viên có 2 tiết liên tiếp buổi sáng Thứ 5 (tiết 4-5)",
    slots: [
      { thu: 5, buoi: "sang", tiet: 4, ma_gv: "phucdq", lop: "8/5", mon: "Ngữ Văn" },
      { thu: 5, buoi: "sang", tiet: 5, ma_gv: "phucdq", lop: "8/2", mon: "Ngữ Văn" },
    ],
  },
];

export const rangBuocMock: RangBuoc[] = [
  {
    id: 1,
    mo_ta: "GV chủ nhiệm không dạy tiết 1 sáng thứ 2",
    loai: "hard",
    rule_ky_thuat: '{"type":"no_monday_morning_slot_1_for_homeroom"}',
    active: true,
  },
  {
    id: 2,
    mo_ta: "Hạn chế dạy 3 tiết liên tục",
    loai: "soft",
    rule_ky_thuat: '{"type":"avoid_three_consecutive_periods"}',
    active: true,
  },
];

export const tkbSummaryMock = {
  so_gv: 12,
  so_lop: 21,
  so_rang_buoc: 8,
  so_phan_cong: 34,
};

export function getGiaoVienByMa(maGv: string) {
  return giaoVienMock.find((gv) => gv.ma_gv.toLowerCase() === maGv.toLowerCase().trim()) ?? null;
}

export function getTKBByMaGv(maGv: string) {
  return tkbMock.filter((slot) => slot.ma_gv.toLowerCase() === maGv.toLowerCase().trim());
}

export function getPhanCongByMaGv(maGv: string) {
  return phanCongMock.filter((pc) => pc.ma_gv.toLowerCase() === maGv.toLowerCase().trim());
}

// ===== Lớp học mock (21 lớp: khối 6-9) =====
export const lopHocMock: LopHoc[] = [
  // Khối 6
  { ten_lop: "6/1", khoi: 6, gvcn: "quynhlt" },
  { ten_lop: "6/2", khoi: 6, gvcn: "anhtn" },
  { ten_lop: "6/3", khoi: 6, gvcn: null },
  { ten_lop: "6/4", khoi: 6, gvcn: "thuynt" },
  { ten_lop: "6/5", khoi: 6, gvcn: null },
  // Khối 7
  { ten_lop: "7/1", khoi: 7, gvcn: "tungbv" },
  { ten_lop: "7/2", khoi: 7, gvcn: null },
  { ten_lop: "7/3", khoi: 7, gvcn: "hoanglv" },
  { ten_lop: "7/4", khoi: 7, gvcn: null },
  { ten_lop: "7/5", khoi: 7, gvcn: "ducnm" },
  // Khối 8
  { ten_lop: "8/1", khoi: 8, gvcn: "namtv" },
  { ten_lop: "8/2", khoi: 8, gvcn: "lanhtm" },
  { ten_lop: "8/3", khoi: 8, gvcn: null },
  { ten_lop: "8/4", khoi: 8, gvcn: null },
  { ten_lop: "8/5", khoi: 8, gvcn: "phucdq" },
  // Khối 9
  { ten_lop: "9/1", khoi: 9, gvcn: "lienhtt" },
  { ten_lop: "9/2", khoi: 9, gvcn: null },
  { ten_lop: "9/3", khoi: 9, gvcn: "kiennc" },
  { ten_lop: "9/4", khoi: 9, gvcn: null },
  { ten_lop: "9/5", khoi: 9, gvcn: null },
  { ten_lop: "9/6", khoi: 9, gvcn: null },
];

export function getTKBByLop(lop: string) {
  return tkbMock.filter((slot) => slot.lop.toLowerCase() === lop.toLowerCase().trim());
}

export function getGVCNByLop(lop: string) {
  const lopHoc = lopHocMock.find((l) => l.ten_lop.toLowerCase() === lop.toLowerCase().trim());
  if (!lopHoc?.gvcn) return null;
  return giaoVienMock.find((gv) => gv.ma_gv === lopHoc.gvcn) ?? null;
}

export function getLopHocByTen(tenLop: string) {
  return lopHocMock.find((lop) => lop.ten_lop.toLowerCase() === tenLop.toLowerCase().trim()) ?? null;
}

// ===== LopHoc CRUD (mock) =====
export function addLopHoc(newLop: LopHoc) {
  const exists = lopHocMock.some(l => l.ten_lop.toLowerCase() === newLop.ten_lop.toLowerCase());
  if (exists) throw new Error(`Lớp ${newLop.ten_lop} đã tồn tại`);
  if (newLop.khoi < 6 || newLop.khoi > 9) throw new Error('Khối phải từ 6-9');
  const id = Date.now();
  const lopWithId = { ...newLop, id };
  lopHocMock.push(lopWithId);
  return lopWithId;
}

export function updateLopHoc(tenLop: string, updates: Partial<Omit<LopHoc, 'ten_lop'>>) {
  const lop = lopHocMock.find(l => l.ten_lop.toLowerCase() === tenLop.toLowerCase());
  if (!lop) throw new Error(`Không tìm thấy lớp ${tenLop}`);
  Object.assign(lop, updates);
  return lop;
}

export function deleteLopHoc(tenLop: string) {
  const index = lopHocMock.findIndex(l => l.ten_lop.toLowerCase() === tenLop.toLowerCase());
  if (index === -1) throw new Error(`Không tìm thấy lớp ${tenLop}`);
  return lopHocMock.splice(index, 1)[0];
}

// Admin credentials mock
export const adminCredentials = {
  username: "admin",
  password: "123",
};

export function verifyAdmin(username: string, password: string): boolean {
  return (
    username.trim().toLowerCase() === adminCredentials.username &&
    password === adminCredentials.password
  );
}

