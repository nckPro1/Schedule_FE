import type { GiaoVien, PhanCong, DinhMuc, RangBuoc, LopHoc, TKBSlot, GvAccount } from "./types";

// ─── Tài khoản giáo viên ──────────────────────────────────────────────────────

export const GV_ACCOUNTS: GvAccount[] = [
  { ma_gv: "GV001", ho_ten: "Nguyễn Văn An",   username: "nguyenan",   password: "123456", to_chuyen_mon: "Toán - Tin",   lop_chu_nhiem: "6A" },
  { ma_gv: "GV002", ho_ten: "Trần Thị Bình",   username: "tranhbinh",  password: "123456", to_chuyen_mon: "Ngữ Văn",     lop_chu_nhiem: "7B" },
  { ma_gv: "GV003", ho_ten: "Lê Minh Cường",   username: "lecuong",    password: "123456", to_chuyen_mon: "Ngoại Ngữ",  lop_chu_nhiem: null },
  { ma_gv: "GV004", ho_ten: "Phạm Thu Dung",   username: "phamdung",   password: "123456", to_chuyen_mon: "KHTN",        lop_chu_nhiem: "8A" },
  { ma_gv: "GV005", ho_ten: "Hoàng Văn Em",    username: "hoangem",    password: "123456", to_chuyen_mon: "Sử - Địa",   lop_chu_nhiem: null },
  { ma_gv: "GV006", ho_ten: "Vũ Thị Phương",   username: "vuphuong",   password: "123456", to_chuyen_mon: "GDCD - TD",  lop_chu_nhiem: "9A" },
];

// ─── Giáo viên ────────────────────────────────────────────────────────────────

export const MOCK_GIAO_VIEN: GiaoVien[] = [
  { id: 1, ma_gv: "GV001", ho_ten: "Nguyễn Văn An",   to_chuyen_mon: "Toán - Tin",  chuc_vu: "Tổ trưởng", lop_chu_nhiem: "6A",  active: true, tong_tiet: 18 },
  { id: 2, ma_gv: "GV002", ho_ten: "Trần Thị Bình",   to_chuyen_mon: "Ngữ Văn",    chuc_vu: null,        lop_chu_nhiem: "7B",  active: true, tong_tiet: 16 },
  { id: 3, ma_gv: "GV003", ho_ten: "Lê Minh Cường",   to_chuyen_mon: "Ngoại Ngữ", chuc_vu: null,        lop_chu_nhiem: null,  active: true, tong_tiet: 16 },
  { id: 4, ma_gv: "GV004", ho_ten: "Phạm Thu Dung",   to_chuyen_mon: "KHTN",       chuc_vu: "Tổ phó",   lop_chu_nhiem: "8A",  active: true, tong_tiet: 16 },
  { id: 5, ma_gv: "GV005", ho_ten: "Hoàng Văn Em",    to_chuyen_mon: "Sử - Địa",  chuc_vu: null,        lop_chu_nhiem: null,  active: true, tong_tiet: 16 },
  { id: 6, ma_gv: "GV006", ho_ten: "Vũ Thị Phương",   to_chuyen_mon: "GDCD - TD", chuc_vu: null,        lop_chu_nhiem: "9A",  active: true, tong_tiet: 16 },
];

// ─── Lớp học ──────────────────────────────────────────────────────────────────

export const MOCK_LOP_HOC: LopHoc[] = [
  { id: 1,  ten_lop: "6A", khoi: 6, gvcn: "GV001" },
  { id: 2,  ten_lop: "6B", khoi: 6, gvcn: null },
  { id: 3,  ten_lop: "6C", khoi: 6, gvcn: null },
  { id: 4,  ten_lop: "7A", khoi: 7, gvcn: null },
  { id: 5,  ten_lop: "7B", khoi: 7, gvcn: "GV002" },
  { id: 6,  ten_lop: "7C", khoi: 7, gvcn: null },
  { id: 7,  ten_lop: "8A", khoi: 8, gvcn: "GV004" },
  { id: 8,  ten_lop: "8B", khoi: 8, gvcn: null },
  { id: 9,  ten_lop: "9A", khoi: 9, gvcn: "GV006" },
  { id: 10, ten_lop: "9B", khoi: 9, gvcn: null },
];

// ─── Phân công ────────────────────────────────────────────────────────────────

export const MOCK_PHAN_CONG: PhanCong[] = [
  // GV001 - Toán
  { id:  1, ma_gv: "GV001", lop: "6A", mon: "Toán", so_tiet_tuan: 4 },
  { id:  2, ma_gv: "GV001", lop: "6B", mon: "Toán", so_tiet_tuan: 4 },
  { id:  3, ma_gv: "GV001", lop: "7A", mon: "Toán", so_tiet_tuan: 4 },
  { id:  4, ma_gv: "GV001", lop: "7B", mon: "Toán", so_tiet_tuan: 4 },
  // GV002 - Ngữ Văn
  { id:  5, ma_gv: "GV002", lop: "6A", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id:  6, ma_gv: "GV002", lop: "6B", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id:  7, ma_gv: "GV002", lop: "8A", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  { id:  8, ma_gv: "GV002", lop: "8B", mon: "Ngữ Văn", so_tiet_tuan: 4 },
  // GV003 - Tiếng Anh
  { id:  9, ma_gv: "GV003", lop: "7A", mon: "Tiếng Anh", so_tiet_tuan: 4 },
  { id: 10, ma_gv: "GV003", lop: "7B", mon: "Tiếng Anh", so_tiet_tuan: 4 },
  { id: 11, ma_gv: "GV003", lop: "8A", mon: "Tiếng Anh", so_tiet_tuan: 4 },
  { id: 12, ma_gv: "GV003", lop: "9A", mon: "Tiếng Anh", so_tiet_tuan: 4 },
  // GV004 - KHTN
  { id: 13, ma_gv: "GV004", lop: "7A", mon: "KHTN", so_tiet_tuan: 4 },
  { id: 14, ma_gv: "GV004", lop: "8A", mon: "KHTN", so_tiet_tuan: 4 },
  { id: 15, ma_gv: "GV004", lop: "8B", mon: "KHTN", so_tiet_tuan: 4 },
  { id: 16, ma_gv: "GV004", lop: "9B", mon: "KHTN", so_tiet_tuan: 4 },
  // GV005 - Lịch Sử
  { id: 17, ma_gv: "GV005", lop: "6C", mon: "Lịch Sử", so_tiet_tuan: 2 },
  { id: 18, ma_gv: "GV005", lop: "7B", mon: "Lịch Sử", so_tiet_tuan: 2 },
  { id: 19, ma_gv: "GV005", lop: "8A", mon: "Lịch Sử", so_tiet_tuan: 2 },
  { id: 20, ma_gv: "GV005", lop: "9A", mon: "Lịch Sử", so_tiet_tuan: 2 },
  { id: 21, ma_gv: "GV005", lop: "9B", mon: "Địa Lý",  so_tiet_tuan: 2 },
  { id: 22, ma_gv: "GV005", lop: "8B", mon: "Địa Lý",  so_tiet_tuan: 2 },
  // GV006 - GDCD
  { id: 23, ma_gv: "GV006", lop: "6A", mon: "GDCD", so_tiet_tuan: 2 },
  { id: 24, ma_gv: "GV006", lop: "7A", mon: "GDCD", so_tiet_tuan: 2 },
  { id: 25, ma_gv: "GV006", lop: "9A", mon: "Thể dục", so_tiet_tuan: 2 },
  { id: 26, ma_gv: "GV006", lop: "9B", mon: "Thể dục", so_tiet_tuan: 2 },
];

// ─── TKB (Thời khóa biểu) ─────────────────────────────────────────────────────
// Thu 2=Thứ Hai, 3=Thứ Ba, 4=Thứ Tư, 5=Thứ Năm, 6=Thứ Sáu, 7=Thứ Bảy

export const MOCK_TKB: TKBSlot[] = [
  // ── GV001 – Toán ──────────────────────────────────────────────────────────
  { id:  1, thu: 2, buoi: "sang",  tiet: 1, ma_gv: "GV001", lop: "6A", mon: "Toán" },
  { id:  2, thu: 2, buoi: "sang",  tiet: 2, ma_gv: "GV001", lop: "6B", mon: "Toán" },
  { id:  3, thu: 3, buoi: "sang",  tiet: 1, ma_gv: "GV001", lop: "7A", mon: "Toán" },
  { id:  4, thu: 3, buoi: "sang",  tiet: 2, ma_gv: "GV001", lop: "7B", mon: "Toán" },
  { id:  5, thu: 4, buoi: "sang",  tiet: 3, ma_gv: "GV001", lop: "6A", mon: "Toán" },
  { id:  6, thu: 4, buoi: "sang",  tiet: 4, ma_gv: "GV001", lop: "6B", mon: "Toán" },
  { id:  7, thu: 5, buoi: "sang",  tiet: 1, ma_gv: "GV001", lop: "7A", mon: "Toán" },
  { id:  8, thu: 5, buoi: "sang",  tiet: 2, ma_gv: "GV001", lop: "7B", mon: "Toán" },
  { id:  9, thu: 6, buoi: "sang",  tiet: 1, ma_gv: "GV001", lop: "6A", mon: "Toán" },
  { id: 10, thu: 6, buoi: "sang",  tiet: 3, ma_gv: "GV001", lop: "6B", mon: "Toán" },

  // ── GV002 – Ngữ Văn ────────────────────────────────────────────────────────
  { id: 11, thu: 2, buoi: "sang",  tiet: 3, ma_gv: "GV002", lop: "6A", mon: "Ngữ Văn" },
  { id: 12, thu: 2, buoi: "sang",  tiet: 4, ma_gv: "GV002", lop: "8A", mon: "Ngữ Văn" },
  { id: 13, thu: 3, buoi: "chieu", tiet: 1, ma_gv: "GV002", lop: "6B", mon: "Ngữ Văn" },
  { id: 14, thu: 3, buoi: "chieu", tiet: 2, ma_gv: "GV002", lop: "8B", mon: "Ngữ Văn" },
  { id: 15, thu: 4, buoi: "sang",  tiet: 1, ma_gv: "GV002", lop: "6A", mon: "Ngữ Văn" },
  { id: 16, thu: 4, buoi: "chieu", tiet: 1, ma_gv: "GV002", lop: "8A", mon: "Ngữ Văn" },
  { id: 17, thu: 5, buoi: "chieu", tiet: 1, ma_gv: "GV002", lop: "6B", mon: "Ngữ Văn" },
  { id: 18, thu: 5, buoi: "chieu", tiet: 2, ma_gv: "GV002", lop: "8B", mon: "Ngữ Văn" },
  { id: 19, thu: 6, buoi: "sang",  tiet: 2, ma_gv: "GV002", lop: "6A", mon: "Ngữ Văn" },
  { id: 20, thu: 6, buoi: "chieu", tiet: 1, ma_gv: "GV002", lop: "8A", mon: "Ngữ Văn" },

  // ── GV003 – Tiếng Anh ──────────────────────────────────────────────────────
  { id: 21, thu: 2, buoi: "chieu", tiet: 1, ma_gv: "GV003", lop: "7A", mon: "Tiếng Anh" },
  { id: 22, thu: 2, buoi: "chieu", tiet: 2, ma_gv: "GV003", lop: "7B", mon: "Tiếng Anh" },
  { id: 23, thu: 3, buoi: "sang",  tiet: 3, ma_gv: "GV003", lop: "8A", mon: "Tiếng Anh" },
  { id: 24, thu: 3, buoi: "sang",  tiet: 4, ma_gv: "GV003", lop: "9A", mon: "Tiếng Anh" },
  { id: 25, thu: 4, buoi: "sang",  tiet: 2, ma_gv: "GV003", lop: "7A", mon: "Tiếng Anh" },
  { id: 26, thu: 4, buoi: "chieu", tiet: 2, ma_gv: "GV003", lop: "7B", mon: "Tiếng Anh" },
  { id: 27, thu: 5, buoi: "sang",  tiet: 3, ma_gv: "GV003", lop: "8A", mon: "Tiếng Anh" },
  { id: 28, thu: 5, buoi: "chieu", tiet: 3, ma_gv: "GV003", lop: "9A", mon: "Tiếng Anh" },
  { id: 29, thu: 6, buoi: "sang",  tiet: 4, ma_gv: "GV003", lop: "7A", mon: "Tiếng Anh" },
  { id: 30, thu: 6, buoi: "chieu", tiet: 2, ma_gv: "GV003", lop: "7B", mon: "Tiếng Anh" },

  // ── GV004 – KHTN ───────────────────────────────────────────────────────────
  { id: 31, thu: 2, buoi: "sang",  tiet: 5, ma_gv: "GV004", lop: "8A", mon: "KHTN" },
  { id: 32, thu: 2, buoi: "chieu", tiet: 3, ma_gv: "GV004", lop: "9B", mon: "KHTN" },
  { id: 33, thu: 3, buoi: "chieu", tiet: 3, ma_gv: "GV004", lop: "7A", mon: "KHTN" },
  { id: 34, thu: 3, buoi: "chieu", tiet: 4, ma_gv: "GV004", lop: "8B", mon: "KHTN" },
  { id: 35, thu: 4, buoi: "chieu", tiet: 3, ma_gv: "GV004", lop: "8A", mon: "KHTN" },
  { id: 36, thu: 4, buoi: "chieu", tiet: 4, ma_gv: "GV004", lop: "9B", mon: "KHTN" },
  { id: 37, thu: 5, buoi: "sang",  tiet: 4, ma_gv: "GV004", lop: "7A", mon: "KHTN" },
  { id: 38, thu: 5, buoi: "chieu", tiet: 4, ma_gv: "GV004", lop: "8B", mon: "KHTN" },
  { id: 39, thu: 6, buoi: "sang",  tiet: 5, ma_gv: "GV004", lop: "8A", mon: "KHTN" },
  { id: 40, thu: 6, buoi: "chieu", tiet: 3, ma_gv: "GV004", lop: "9B", mon: "KHTN" },

  // ── GV005 – Lịch Sử / Địa Lý ──────────────────────────────────────────────
  { id: 41, thu: 2, buoi: "chieu", tiet: 4, ma_gv: "GV005", lop: "9A", mon: "Lịch Sử" },
  { id: 42, thu: 2, buoi: "chieu", tiet: 5, ma_gv: "GV005", lop: "8A", mon: "Lịch Sử" },
  { id: 43, thu: 3, buoi: "sang",  tiet: 5, ma_gv: "GV005", lop: "9B", mon: "Địa Lý" },
  { id: 44, thu: 3, buoi: "chieu", tiet: 5, ma_gv: "GV005", lop: "6C", mon: "Lịch Sử" },
  { id: 45, thu: 4, buoi: "sang",  tiet: 5, ma_gv: "GV005", lop: "7B", mon: "Lịch Sử" },
  { id: 46, thu: 4, buoi: "chieu", tiet: 5, ma_gv: "GV005", lop: "8B", mon: "Địa Lý" },
  { id: 47, thu: 5, buoi: "sang",  tiet: 5, ma_gv: "GV005", lop: "8A", mon: "Lịch Sử" },
  { id: 48, thu: 5, buoi: "chieu", tiet: 5, ma_gv: "GV005", lop: "9B", mon: "Địa Lý" },
  { id: 49, thu: 6, buoi: "chieu", tiet: 4, ma_gv: "GV005", lop: "6C", mon: "Lịch Sử" },
  { id: 50, thu: 6, buoi: "chieu", tiet: 5, ma_gv: "GV005", lop: "7B", mon: "Địa Lý" },

  // ── GV006 – GDCD / Thể dục ─────────────────────────────────────────────────
  { id: 51, thu: 2, buoi: "sang",  tiet: 2, ma_gv: "GV006", lop: "9A", mon: "Thể dục" },  // wait GV001 has thu2 sang2 → 6B. GV006 dạy khác lớp nên ok
  { id: 52, thu: 2, buoi: "sang",  tiet: 3, ma_gv: "GV006", lop: "9B", mon: "Thể dục" },  // but GV002 has thu2 sang3 → 6A. Different class, ok
  { id: 53, thu: 3, buoi: "sang",  tiet: 1, ma_gv: "GV006", lop: "6A", mon: "GDCD" },     // GV001 has thu3 sang1 → 7A. Different. But wait GV001 teaches 7A thu3 sang1. GV006 teaches 6A thu3 sang1. OK different classes and teachers.
  { id: 54, thu: 3, buoi: "sang",  tiet: 2, ma_gv: "GV006", lop: "7A", mon: "GDCD" },
  { id: 55, thu: 4, buoi: "sang",  tiet: 1, ma_gv: "GV006", lop: "9A", mon: "Thể dục" },  // GV002 has thu4 sang1 → 6A. Different, ok
  { id: 56, thu: 4, buoi: "sang",  tiet: 2, ma_gv: "GV006", lop: "9B", mon: "Thể dục" },  // GV003 has thu4 sang2 → 7A. Different, ok
  { id: 57, thu: 5, buoi: "sang",  tiet: 1, ma_gv: "GV006", lop: "6A", mon: "GDCD" },     // GV001 has thu5 sang1 → 7A. Different, ok
  { id: 58, thu: 5, buoi: "sang",  tiet: 2, ma_gv: "GV006", lop: "7A", mon: "GDCD" },     // GV001 has thu5 sang2 → 7B. Different lop, ok
  { id: 59, thu: 6, buoi: "sang",  tiet: 1, ma_gv: "GV006", lop: "9A", mon: "Thể dục" },  // GV001 has thu6 sang1 → 6A. Different, ok
  { id: 60, thu: 6, buoi: "sang",  tiet: 2, ma_gv: "GV006", lop: "9B", mon: "Thể dục" },  // GV002 has thu6 sang2 → 6A. Different, ok
];

// ─── Định mức ─────────────────────────────────────────────────────────────────

export const MOCK_DINH_MUC: DinhMuc[] = [
  { id: 1, khoi: "6", mon: "Toán",       so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id: 2, khoi: "6", mon: "Ngữ Văn",   so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id: 3, khoi: "6", mon: "Tiếng Anh", so_tiet_tuan: 3, gioi_han_buoi: 2 },
  { id: 4, khoi: "6", mon: "KHTN",      so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id: 5, khoi: "6", mon: "Lịch Sử",  so_tiet_tuan: 2, gioi_han_buoi: 1 },
  { id: 6, khoi: "6", mon: "Địa Lý",   so_tiet_tuan: 2, gioi_han_buoi: 1 },
  { id: 7, khoi: "6", mon: "GDCD",      so_tiet_tuan: 1, gioi_han_buoi: 1 },
  { id: 8, khoi: "7", mon: "Toán",       so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id: 9, khoi: "7", mon: "Ngữ Văn",   so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id:10, khoi: "7", mon: "Tiếng Anh", so_tiet_tuan: 3, gioi_han_buoi: 2 },
  { id:11, khoi: "8", mon: "Toán",       so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id:12, khoi: "8", mon: "Ngữ Văn",   so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id:13, khoi: "9", mon: "Toán",       so_tiet_tuan: 4, gioi_han_buoi: 2 },
  { id:14, khoi: "9", mon: "Tiếng Anh", so_tiet_tuan: 4, gioi_han_buoi: 2 },
];

// ─── Ràng buộc ────────────────────────────────────────────────────────────────

export const MOCK_RANG_BUOC: RangBuoc[] = [
  { id: 1, rule_code: "NO_CONSECUTIVE_5", mo_ta: "Giáo viên không dạy 5 tiết liên tiếp", loai: "hard", active: true, is_template: true, editable_params: [] },
  { id: 2, rule_code: "MAX_2_PER_DAY",    mo_ta: "Tối đa 2 tiết/ngày/môn cho 1 lớp",   loai: "hard", active: true, is_template: true, editable_params: [] },
  { id: 3, rule_code: "NO_SPLIT_SESSION", mo_ta: "Không tách buổi với môn chỉ 1 tiết/tuần", loai: "soft", active: true, is_template: true, editable_params: [] },
  { id: 4, rule_code: "BALANCE_WEEK",     mo_ta: "Phân phối đều tiết trong tuần",         loai: "soft", active: true, is_template: true, editable_params: [] },
  { id: 5, rule_code: "GVCN_MONDAY",      mo_ta: "GVCN có tiết đầu thứ Hai (chào cờ)",  loai: "hard", active: true, is_template: true, editable_params: [] },
];
