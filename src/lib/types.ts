export interface GiaoVien {
  id: number;
  ma_gv: string;
  ho_ten: string;
  to_chuyen_mon: string;
  chuc_vu: string | null;
  so_tiet_chuan?: number;
  tong_tiet?: number;
  so_tiet_kiem_nhiem?: number;
  so_tiet_chuyen_mon?: number;
  lop_chu_nhiem: string | null;
  active: boolean;
}

export interface PhanCong {
  id: number;
  ma_gv: string;
  lop: string;
  mon: string;
  so_tiet_tuan: number;
}

export interface DinhMuc {
  id?: number;
  khoi: string;
  mon: string;
  so_tiet_tuan: number;
  gioi_han_buoi: number;
}

export interface RangBuocEditableParamSpec {
  key: string;
  label: string;
  type: "int" | "int_list" | "json";
  min?: number;
  max?: number;
}

export interface RangBuoc {
  id: number;
  rule_code?: string | null;
  mo_ta: string;
  loai: "hard" | "soft";
  rule_ky_thuat?: Record<string, unknown> | null;
  active: boolean;
  is_template: boolean;
  editable_params: RangBuocEditableParamSpec[];
}

export interface RangBuocCreatePayload {
  mo_ta: string;
  loai: "hard" | "soft";
  rule_code?: string | null;
  structured_rule?: Record<string, unknown>;
}

export interface RangBuocUpdatePayload {
  mo_ta?: string;
  loai?: "hard" | "soft";
  active?: boolean;
  rule_ky_thuat?: Record<string, unknown>;
  structured_rule?: Record<string, unknown>;
}

export interface TKBSlot {
  id?: number;
  thu: number;
  buoi: "sang" | "chieu";
  tiet: number;
  ma_gv: string;
  lop: string;
  mon: string;
}

export interface TKBGrid {
  [ma_gv: string]: TKBSlot[];
}

export interface LopHoc {
  id?: number;
  ten_lop: string;
  khoi: number;
  gvcn?: string | null;
}

export interface CanhBao {
  loai: "hard" | "soft";
  ma_gv: string;
  mo_ta: string;
  slot_ids?: number[];
  slots?: TKBSlot[];
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface GvAccount {
  ma_gv: string;
  ho_ten: string;
  username: string;
  password: string;
  to_chuyen_mon: string;
  lop_chu_nhiem?: string | null;
}

// ─── Điểm danh ────────────────────────────────────────────────────────────────

export type TrangThaiDiemDanh =
  | "chua_diem_danh"
  | "dung_gio"
  | "muon"
  | "tre"
  | "vang_mat";

export interface DiemDanhRecord {
  id: string;
  slot_id: number;
  ma_gv: string;
  ho_ten_gv: string;
  ngay: string;           // "YYYY-MM-DD"
  thu: number;            // 2–7
  buoi: "sang" | "chieu";
  tiet: number;           // 1–5
  lop: string;
  mon: string;
  gio_bat_dau: string;    // "07:00"
  gio_ket_thuc: string;   // "07:45"

  // Check-in
  trang_thai: TrangThaiDiemDanh;
  thoi_gian_vao?: string; // ISO timestamp
  anh_vao?: string;       // base64 jpeg
  tre_phut?: number;      // số phút trễ

  // Check-out
  da_diem_danh_ra: boolean;
  thoi_gian_ra?: string;
  anh_ra?: string;

  // Giải trình (GV gửi)
  ghi_chu?: string;
  da_giai_trinh?: boolean;

  // Xử lý giải trình (Admin)
  xu_ly_giai_trinh?: "chap_nhan" | "tu_choi";
  admin_phan_hoi?: string;
}
