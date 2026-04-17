/**
 * localStorage-backed store cho tất cả demo data.
 * Seed từ mock-data.ts lần đầu tiên, sau đó persist mọi thay đổi.
 */
import type { DinhMuc, GiaoVien, LopHoc, PhanCong, RangBuoc, TKBSlot } from "./types";
import {
  MOCK_DINH_MUC,
  MOCK_GIAO_VIEN,
  MOCK_LOP_HOC,
  MOCK_PHAN_CONG,
  MOCK_RANG_BUOC,
  MOCK_TKB,
} from "./mock-data";

const VERSION = "v2";
const V_KEY = "demo_store_version";
const KEYS = {
  gv:  "demo_giao_vien",
  pc:  "demo_phan_cong",
  dm:  "demo_dinh_muc",
  rb:  "demo_rang_buoc",
  lop: "demo_lop_hoc",
  tkb: "demo_tkb_slots",
};

function seed() {
  localStorage.setItem(KEYS.gv,  JSON.stringify(MOCK_GIAO_VIEN));
  localStorage.setItem(KEYS.pc,  JSON.stringify(MOCK_PHAN_CONG));
  localStorage.setItem(KEYS.dm,  JSON.stringify(MOCK_DINH_MUC));
  localStorage.setItem(KEYS.rb,  JSON.stringify(MOCK_RANG_BUOC));
  localStorage.setItem(KEYS.lop, JSON.stringify(MOCK_LOP_HOC));
  localStorage.setItem(KEYS.tkb, JSON.stringify(MOCK_TKB));
  localStorage.setItem(V_KEY, VERSION);
}

function init() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(V_KEY) !== VERSION) seed();
}

function get<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return [...fallback];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [...fallback];
  } catch {
    return [...fallback];
  }
}

function set<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

init();

export const store = {
  getGv:   ()                  => get<GiaoVien>(KEYS.gv,  MOCK_GIAO_VIEN),
  setGv:   (d: GiaoVien[])    => set(KEYS.gv,  d),

  getPc:   ()                  => get<PhanCong>(KEYS.pc,  MOCK_PHAN_CONG),
  setPc:   (d: PhanCong[])    => set(KEYS.pc,  d),

  getDm:   ()                  => get<DinhMuc>(KEYS.dm,  MOCK_DINH_MUC),
  setDm:   (d: DinhMuc[])     => set(KEYS.dm,  d),

  getRb:   ()                  => get<RangBuoc>(KEYS.rb,  MOCK_RANG_BUOC),
  setRb:   (d: RangBuoc[])    => set(KEYS.rb,  d),

  getLop:  ()                  => get<LopHoc>(KEYS.lop, MOCK_LOP_HOC),
  setLop:  (d: LopHoc[])      => set(KEYS.lop, d),

  getTkb:  ()                  => get<TKBSlot>(KEYS.tkb, MOCK_TKB),
  setTkb:  (d: TKBSlot[])     => set(KEYS.tkb, d),

  clearAll: () => {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => localStorage.setItem(k, "[]"));
  },

  resetToMock: () => {
    if (typeof window === "undefined") return;
    seed();
  },
};
