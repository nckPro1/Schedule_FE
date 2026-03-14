export interface GiaoVien {
  id: number;
  ma_gv: string;
  ho_ten: string;
  to_chuyen_mon: string;
  chuc_vu: string | null;
  so_tiet_chuan: number;
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
  khoi: string;
  mon: string;
  so_tiet_tuan: number;
  gioi_han_buoi: number;
}

export interface RangBuoc {
  id: number;
  mo_ta: string;
  loai: "hard" | "soft";
  rule_ky_thuat: string;
  active: boolean;
}

export interface TKBSlot {
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
  slots: TKBSlot[];
}
