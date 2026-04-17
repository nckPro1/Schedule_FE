import type { DiemDanhRecord, TrangThaiDiemDanh } from "./types";
import { getPeriodTime, getDateForThu } from "./time-utils";

const STORE_KEY = "diem_danh_records";
const STORE_VERSION = "v3"; // bump khi thay đổi seed data
const VERSION_KEY = "diem_danh_version";

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
    // annv tuần trước — đúng giờ
    {
      id: "seed-1", slot_id: 1, ma_gv: "annv", ho_ten_gv: "Nguyễn Văn An",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 1, lop: "6/1", mon: "Toán",
      gio_bat_dau: "07:30", gio_ket_thuc: "08:15",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T07:32:14",
      tre_phut: 2, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T08:15:08",
    },
    {
      id: "seed-2", slot_id: 2, ma_gv: "annv", ho_ten_gv: "Nguyễn Văn An",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 2, lop: "6/2", mon: "Toán",
      gio_bat_dau: "08:20", gio_ket_thuc: "09:05",
      trang_thai: "muon", thoi_gian_vao: lastWeekDate(2) + "T08:27:44",
      tre_phut: 7, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T09:05:30",
    },
    {
      id: "seed-3", slot_id: 3, ma_gv: "annv", ho_ten_gv: "Nguyễn Văn An",
      ngay: lastWeekDate(3), thu: 3, buoi: "sang", tiet: 1, lop: "7/1", mon: "Toán",
      gio_bat_dau: "07:30", gio_ket_thuc: "08:15",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(3) + "T07:31:05",
      tre_phut: 1, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(3) + "T08:16:02",
    },
    // binhtt tuần trước — có 1 vắng mặt
    {
      id: "seed-4", slot_id: 7, ma_gv: "binhtt", ho_ten_gv: "Trần Thị Bình",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 3, lop: "6/1", mon: "Ngữ Văn",
      gio_bat_dau: "09:10", gio_ket_thuc: "09:55",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T09:11:55",
      tre_phut: 1, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T09:55:22",
    },
    {
      id: "seed-5", slot_id: 10, ma_gv: "binhtt", ho_ten_gv: "Trần Thị Bình",
      ngay: lastWeekDate(2), thu: 2, buoi: "sang", tiet: 4, lop: "6/2", mon: "Ngữ Văn",
      gio_bat_dau: "10:00", gio_ket_thuc: "10:45",
      trang_thai: "vang_mat", da_diem_danh_ra: false,
      ghi_chu: "Bị ốm đột xuất, đã báo cáo ban giám hiệu", da_giai_trinh: true,
    },
    {
      id: "seed-6", slot_id: 9, ma_gv: "binhtt", ho_ten_gv: "Trần Thị Bình",
      ngay: lastWeekDate(3), thu: 3, buoi: "chieu", tiet: 1, lop: "6/3", mon: "Ngữ Văn",
      gio_bat_dau: "13:00", gio_ket_thuc: "13:45",
      trang_thai: "tre", thoi_gian_vao: lastWeekDate(3) + "T13:12:30",
      tre_phut: 12, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(3) + "T13:45:15",
    },
    // cuonglm tuần trước
    {
      id: "seed-7", slot_id: 13, ma_gv: "cuonglm", ho_ten_gv: "Lê Minh Cường",
      ngay: lastWeekDate(2), thu: 2, buoi: "chieu", tiet: 1, lop: "6/1", mon: "Tiếng Anh",
      gio_bat_dau: "13:00", gio_ket_thuc: "13:45",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T13:00:45",
      tre_phut: 0, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T13:44:58",
    },
    {
      id: "seed-8", slot_id: 15, ma_gv: "cuonglm", ho_ten_gv: "Lê Minh Cường",
      ngay: lastWeekDate(3), thu: 3, buoi: "chieu", tiet: 1, lop: "6/3", mon: "Tiếng Anh",
      gio_bat_dau: "13:00", gio_ket_thuc: "13:45",
      trang_thai: "muon", thoi_gian_vao: lastWeekDate(3) + "T13:08:12",
      tre_phut: 8, da_diem_danh_ra: false,
    },
    // dungpt tuần trước
    {
      id: "seed-9", slot_id: 19, ma_gv: "dungpt", ho_ten_gv: "Phạm Thu Dung",
      ngay: lastWeekDate(2), thu: 2, buoi: "chieu", tiet: 3, lop: "6/1", mon: "KHTN",
      gio_bat_dau: "14:40", gio_ket_thuc: "15:25",
      trang_thai: "dung_gio", thoi_gian_vao: lastWeekDate(2) + "T14:42:30",
      tre_phut: 2, da_diem_danh_ra: true,
      thoi_gian_ra: lastWeekDate(2) + "T15:25:10",
    },
    {
      id: "seed-10", slot_id: 20, ma_gv: "dungpt", ho_ten_gv: "Phạm Thu Dung",
      ngay: lastWeekDate(2), thu: 2, buoi: "chieu", tiet: 4, lop: "6/2", mon: "KHTN",
      gio_bat_dau: "15:30", gio_ket_thuc: "16:15",
      trang_thai: "vang_mat", da_diem_danh_ra: false,
      ghi_chu: "", da_giai_trinh: false,
    },
  ];
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

function loadAll(): DiemDanhRecord[] {
  if (typeof window === "undefined") return [];
  // Reset nếu seed data đã thay đổi (version mismatch)
  if (localStorage.getItem(VERSION_KEY) !== STORE_VERSION) {
    localStorage.removeItem(STORE_KEY);
    localStorage.setItem(VERSION_KEY, STORE_VERSION);
  }
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
  anh_lop?: string;
  tre_phut: number;
}): DiemDanhRecord {
  const pt = getPeriodTime(params.buoi, params.tiet);
  const { anh_lop, ...rest } = params;
  const record: DiemDanhRecord = {
    id: `dd-${params.slot_id}-${params.ngay}`,
    ...rest,
    anh_ra: anh_lop,
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

export function processGiaiTrinh(id: string, xu_ly: "chap_nhan" | "tu_choi", phan_hoi?: string): void {
  const all = loadAll();
  const rec = all.find((r) => r.id === id);
  if (!rec) return;
  rec.xu_ly_giai_trinh = xu_ly;
  rec.admin_phan_hoi = phan_hoi;
  saveAll(all);
}

export function resetStore(): void {
  localStorage.removeItem(STORE_KEY);
}
