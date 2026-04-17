// ─── Giờ các tiết học ─────────────────────────────────────────────────────────

export const PERIOD_TIMES: Record<"sang" | "chieu", Record<number, { start: string; end: string }>> = {
  sang: {
    1: { start: "07:30", end: "08:15" },
    2: { start: "08:20", end: "09:05" },
    3: { start: "09:10", end: "09:55" },
    4: { start: "10:00", end: "10:45" },
    5: { start: "10:50", end: "11:35" },
  },
  chieu: {
    1: { start: "13:00", end: "13:45" },
    2: { start: "13:50", end: "14:35" },
    3: { start: "14:40", end: "15:25" },
    4: { start: "15:30", end: "16:15" },
    5: { start: "16:20", end: "17:05" },
  },
};

export function getPeriodTime(buoi: "sang" | "chieu", tiet: number) {
  return PERIOD_TIMES[buoi][tiet];
}

// ─── Dev Mode (ghi đè giờ hiện tại để demo) ──────────────────────────────────

const DEV_MODE_KEY = "devMode";

export interface DevMode {
  thu: number;   // 2–7
  time: string;  // "HH:MM"
}

export function getDevMode(): DevMode | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DEV_MODE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as DevMode; } catch { return null; }
}

export function setDevMode(thu: number, time: string): void {
  sessionStorage.setItem(DEV_MODE_KEY, JSON.stringify({ thu, time }));
}

export function clearDevMode(): void {
  sessionStorage.removeItem(DEV_MODE_KEY);
}

// ─── Thời gian hiện tại ───────────────────────────────────────────────────────

/** JS getDay(): 0=Sun, 1=Mon..6=Sat → our system: 2=Mon..7=Sat */
function jsDayToThu(jsDay: number): number {
  if (jsDay === 0) return 0; // Chủ nhật — không có tiết
  return jsDay + 1;
}

/**
 * Trả về ISO string LOCAL (không có Z) dùng để lưu thoi_gian_vao/ra.
 * Trong dev mode: ghép ngày dev + giờ dev. Ngoài dev mode: giờ máy thực.
 * Dùng local string (không Z) để toLocaleTimeString hiển thị đúng múi giờ.
 */
export function getCurrentLocalISOString(): string {
  const dev = getDevMode();
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (dev) {
    const date = getTodayDate();
    return `${date}T${dev.time}:00`;
  }
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function getCurrentThu(): number {
  const dev = getDevMode();
  if (dev) return dev.thu;
  return jsDayToThu(new Date().getDay());
}

export function getCurrentTimeStr(): string {
  const dev = getDevMode();
  if (dev) return dev.time;
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

/** ISO date string (YYYY-MM-DD) cho ngày hôm nay (hoặc ngày tương ứng thu trong tuần hiện tại khi devMode) */
export function getTodayDate(): string {
  const dev = getDevMode();
  if (dev) {
    // Tìm ngày trong tuần hiện tại tương ứng với thu
    const now = new Date();
    const jsDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon..7=Sun
    const targetJsDay = dev.thu - 1; // 2→1(Mon)..7→6(Sat)
    const diff = targetJsDay - (now.getDay() === 0 ? 7 : now.getDay());
    const target = new Date(now);
    target.setDate(now.getDate() + diff);
    return target.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

/** Lấy ISO date của thứ X trong tuần hiện tại (2=Thứ Hai .. 7=Thứ Bảy) */
export function getDateForThu(thu: number): string {
  const now = new Date();
  const todayJs = now.getDay(); // 0=Sun, 1=Mon..6=Sat
  const targetJsDay = thu - 1; // our 2→1(Mon), 7→6(Sat)
  const todayJsDay = todayJs === 0 ? 7 : todayJs;
  const diff = targetJsDay - todayJsDay;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Lấy ISO date của thứ X trong tuần lệch weekOffset tuần (0=hiện tại, -1=tuần trước) */
export function getDateForThuWithOffset(thu: number, weekOffset: number): string {
  const now = new Date();
  const todayJs = now.getDay();
  const todayJsDay = todayJs === 0 ? 7 : todayJs;
  const targetJsDay = thu - 1;
  const diff = targetJsDay - todayJsDay + weekOffset * 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// ─── Tính số phút giữa 2 giờ "HH:MM" ─────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesBetween(from: string, to: string): number {
  return timeToMinutes(to) - timeToMinutes(from);
}

// ─── Cửa sổ điểm danh ─────────────────────────────────────────────────────────

export type AttendancePhase =
  | { phase: "too_early";       minutesUntilOpen: number }
  | { phase: "ready";           minutesUntilStart: number }
  | { phase: "open";            trang_thai: "dung_gio" | "muon" | "tre"; minutesDelta: number }
  | { phase: "locked";          minutesOver: number }
  | { phase: "checkout_ready";  minutesIntoPeriod: number }
  | { phase: "period_ended" };

/**
 * Xác định pha điểm danh dựa trên buổi, tiết và giờ hiện tại.
 * minutesDelta > 0: số phút sau giờ bắt đầu
 */
export function getAttendancePhase(
  buoi: "sang" | "chieu",
  tiet: number,
  currentTime: string
): AttendancePhase {
  const pt = getPeriodTime(buoi, tiet);
  if (!pt) return { phase: "period_ended" };

  const delta = minutesBetween(pt.start, currentTime); // + nếu sau giờ bắt đầu
  const periodLen = minutesBetween(pt.start, pt.end);  // 45 phút

  if (delta < -5)  return { phase: "too_early",      minutesUntilOpen: -delta - 5 };
  if (delta < 0)   return { phase: "ready",           minutesUntilStart: -delta };
  if (delta <= 5)  return { phase: "open",            trang_thai: "dung_gio", minutesDelta: delta };
  if (delta <= 10) return { phase: "open",            trang_thai: "muon",     minutesDelta: delta };
  if (delta <= 15) return { phase: "open",            trang_thai: "tre",      minutesDelta: delta };
  if (delta <= periodLen - 5) return { phase: "locked", minutesOver: delta - 15 };
  if (delta <= periodLen + 15) return { phase: "checkout_ready", minutesIntoPeriod: delta };
  return { phase: "period_ended" };
}

/** Kiểm tra xem slot này có phải hôm nay không (so với devMode hoặc giờ thực) */
export function isToday(thu: number): boolean {
  return getCurrentThu() === thu;
}

/** Nhãn hiển thị cho thứ */
export const THU_LABELS: Record<number, string> = {
  2: "Thứ Hai",
  3: "Thứ Ba",
  4: "Thứ Tư",
  5: "Thứ Năm",
  6: "Thứ Sáu",
  7: "Thứ Bảy",
};
