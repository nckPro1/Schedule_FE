import type { DiemDanhRecord, TrangThaiDiemDanh } from "./types";
import { getPeriodTime, getDateForThu } from "./time-utils";

const STORE_KEY = "diem_danh_records";

// ─── Dữ liệu mồi (seed) cho demo ──────────────────────────────────────────────

function buildSeedRecords(): DiemDanhRecord[] {
  // Lấy ngày tuần TRƯỚC để seed dữ liệu sẵn có trong admin
  const lastWeekOffset = -7;
  function lastWeekDate(thu: number): string {
    const d = getDateForThu(thu);
    const dt = new Date(d);
    dt.setDate(dt.getDate() + lastWeekOffset);
    return dt.toISOString().slice(0, 10);
  }

  return [
    // GV001 tuần trước — đủ cả đúng giờ
    {
      id: "seed-1", slot_id: 1, ma_gv: "GV001", ho_ten_gv: "Nguyễn Văn An",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 1, lop: "6A", mon: "Toán",
      gio_bat_dau: "07:00", gio_ket_thuc: "07:45",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T07:03:22.000Z",
      tre_phut: 3, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T07:45:10.000Z",
    },
    {
      id: "seed-2", slot_id: 2, ma_gv: "GV001", ho_ten_gv: "Nguyễn Văn An",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 2, lop: "6B", mon: "Toán",
      gio_bat_dau: "07:50", gio_ket_thuc: "08:35",
      trang_thai: "muon", thoi_gian_vao: lastWeekDate(2) + "T07:57:44.000Z",
      tre_phut: 7, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T08:35:30.000Z",
    },
    {
      id: "seed-3", slot_id: 3, ma_gv: "GV001", ho_ten_gv: "Nguyễn Văn An",
      ngay: lastWeekDate(3), thu: 3, buoi: "sang", tiet: 1, lop: "7A", mon: "Toán",
      gio_bat_dau: "07:00", gio_ket_thuc: "07:45",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(3) + "T07:02:10.000Z",
      tre_phut: 2, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(3) + "T07:46:05.000Z",
    },
    // GV002 tuần trước — có 1 vắng mặt
    {
      id: "seed-4", slot_id: 11, ma_gv: "GV002", ho_ten_gv: "Trần Thị Bình",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 3, lop: "6A", mon: "Ngữ Văn",
      gio_bat_dau: "08:40", gio_ket_thuc: "09:25",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T08:41:55.000Z",
      tre_phut: 1, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T09:25:22.000Z",
    },
    {
      id: "seed-5", slot_id: 12, ma_gv: "GV002", ho_ten_gv: "Trần Thị Bình",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 4, lop: "8A", mon: "Ngữ Văn",
      gio_bat_dau: "09:30", gio_ket_thuc: "10:15",
      trang_thai: "vang_mat", da_diem_danh_ra: false,
      ghi_chu: "Bị ốm đột xuất, đã báo cáo ban giám hiệu", da_giai_trinh: true,
    },
    {
      id: "seed-6", slot_id: 13, ma_gv: "GV002", ho_ten_gv: "Trần Thị Bình",
      ngay: lastWeekDate(3), thu: 3, buoi: "chieu", tiet: 1, lop: "6B", mon: "Ngữ Văn",
      gio_bat_dau: "13:00", gio_ket_thuc: "13:45",
      trang_thai: "tre", thoi_gian_vao: lastWeekDate(3) + "T13:12:30.000Z",
      tre_phut: 12, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(3) + "T13:45:15.000Z",
    },
    // GV003 tuần trước
    {
      id: "seed-7", slot_id: 21, ma_gv: "GV003", ho_ten_gv: "Lê Minh Cường",
      ngay: lastWeekDate(2), thu: 2, buoi: "chieu", tiet: 1, lop: "7A", mon: "Tiếng Anh",
      gio_bat_dau: "13:00", gio_ket_thuc: "13:45",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T13:00:45.000Z",
      tre_phut: 0, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T13:44:58.000Z",
    },
    {
      id: "seed-8", slot_id: 23, ma_gv: "GV003", ho_ten_gv: "Lê Minh Cường",
      ngay: lastWeekDate(3), thu: 3, buoi: "sang", tiet: 3, lop: "8A", mon: "Tiếng Anh",
      gio_bat_dau: "08:40", gio_ket_thuc: "09:25",
      trang_thai: "muon", thoi_gian_vao: lastWeekDate(3) + "T08:48:12.000Z",
      tre_phut: 8, da_diem_danh_ra: false,
    },
    // GV004 tuần trước
    {
      id: "seed-9", slot_id: 31, ma_gv: "GV004", ho_ten_gv: "Phạm Thu Dung",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 5, lop: "8A", mon: "KHTN",
      gio_bat_dau: "10:20", gio_ket_thuc: "11:05",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T10:22:30.000Z",
      tre_phut: 2, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T11:05:10.000Z",
    },
    {
      id: "seed-10", slot_id: 32, ma_gv: "GV004", ho_ten_gv: "Phạm Thu Dung",
      ngay: lastWeekDate(2), thu: 2, buoi: "chieu", tiet: 3, lop: "9B", mon: "KHTN",
      gio_bat_dau: "14:40", gio_ket_thuc: "15:25",
      trang_thai: "vang_mat", da_diem_danh_ra: false,
      ghi_chu: "", da_giai_trinh: false,
    },
  ];
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

function loadAll(): DiemDanhRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) {
    const seeds = buildSeedRecords();
    localStorage.setItem(STORE_KEY, JSON.stringify(seeds));
    return seeds;
  }
  try { return JSON.parse(raw) as DiemDanhRecord[]; } catch { return []; }
}

function saveAll(records: DiemDanhRecord[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(records));
}

export function getAllRecords(): DiemDanhRecord[] {
  return loadAll();
}

export function getRecordsByGv(ma_gv: string): DiemDanhRecord[] {
  return loadAll().filter((r) => r.ma_gv === ma_gv);
}

export function findRecord(slot_id: number, ngay: string): DiemDanhRecord | null {
  return loadAll().find((r) => r.slot_id === slot_id && r.ngay === ngay) ?? null;
}

export function upsertRecord(record: DiemDanhRecord): void {
  const all = loadAll();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) all[idx] = record;
  else all.push(record);
  saveAll(all);
}

export function createCheckinRecord(params: {
  slot_id: number;
  ma_gv: string;
  ho_ten_gv: string;
  thu: number;
  buoi: "sang" | "chieu";
  tiet: number;
  lop: string;
  mon: string;
  ngay: string;
  trang_thai: TrangThaiDiemDanh;
  thoi_gian_vao: string;
  anh_vao?: string;
  tre_phut: number;
}): DiemDanhRecord {
  const pt = getPeriodTime(params.buoi, params.tiet);
  const record: DiemDanhRecord = {
    id: `dd-${params.slot_id}-${params.ngay}`,
    ...params,
    gio_bat_dau: pt.start,
    gio_ket_thuc: pt.end,
    da_diem_danh_ra: false,
  };
  upsertRecord(record);
  return record;
}

export function updateCheckout(id: string, thoi_gian_ra: string, anh_ra?: string): void {
  const all = loadAll();
  const rec = all.find((r) => r.id === id);
  if (!rec) return;
  rec.da_diem_danh_ra = true;
  rec.thoi_gian_ra = thoi_gian_ra;
  rec.anh_ra = anh_ra;
  saveAll(all);
}

export function updateGhiChu(id: string, ghi_chu: string): void {
  const all = loadAll();
  const rec = all.find((r) => r.id === id);
  if (!rec) return;
  rec.ghi_chu = ghi_chu;
  rec.da_giai_trinh = true;
  saveAll(all);
}

export function resetStore(): void {
  localStorage.removeItem(STORE_KEY);
}
