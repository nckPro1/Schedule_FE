"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getGvSession } from "@/lib/mock-auth";
import { MOCK_TKB } from "@/lib/mock-data";
import {
  getAttendancePhase,
  getCurrentTimeStr,
  getCurrentThu,
  getDateForThu,
  getPeriodTime,
  getDevMode,
  THU_LABELS,
} from "@/lib/time-utils";
import {
  findRecord,
  createCheckinRecord,
  updateCheckout,
} from "@/lib/attendance-store";
import type { GvAccount, DiemDanhRecord, TrangThaiDiemDanh } from "@/lib/types";

// ─── Cấu hình trạng thái ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<TrangThaiDiemDanh, { label: string; desc: string; bg: string; text: string; icon: string }> = {
  dung_gio:       { label: "Đúng giờ",  desc: "Điểm danh thành công",            bg: "#dcfce7", text: "#166534", icon: "check_circle" },
  muon:           { label: "Muộn",      desc: "Vào trễ 5–10 phút so với giờ học", bg: "#fef3c7", text: "#92400e", icon: "schedule" },
  tre:            { label: "Trễ",       desc: "Vào trễ 10–15 phút so với giờ học",bg: "#ffedd5", text: "#7c2d12", icon: "warning" },
  vang_mat:       { label: "Vắng mặt", desc: "Quá 15 phút, tự động ghi vắng",    bg: "#fee2e2", text: "#991b1b", icon: "cancel" },
  chua_diem_danh: { label: "Chưa điểm danh", desc: "", bg: "#f3f4f6", text: "#6b7280", icon: "radio_button_unchecked" },
};

// ─── Camera hook ──────────────────────────────────────────────────────────────

function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream]   = useState<MediaStream | null>(null);
  const [error, setError]     = useState("");
  const [ready, setReady]     = useState(false);

  const start = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(s);
      setError("");
    } catch {
      setError("Không thể truy cập camera. Vui lòng cho phép quyền camera và thử lại.");
    }
  }, []);

  const stop = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setReady(false);
  }, [stream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => setReady(true);
    }
  }, [stream]);

  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);

  const capture = useCallback((): string | null => {
    if (!videoRef.current || !ready) return null;
    const canvas = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth  || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    // Vẽ KHÔNG mirror — ảnh lưu giống người khác nhìn thấy
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.75);
  }, [ready]);

  return { videoRef, stream, error, ready, start, stop, capture };
}

// ─── Ảnh demo (không cần camera) ──────────────────────────────────────────────

function generateDemoImage(type: "vao" | "ra"): string {
  const canvas = document.createElement("canvas");
  canvas.width = 640; canvas.height = 480;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, type === "vao" ? "#1e3a8a" : "#14532d");
  grad.addColorStop(1, type === "vao" ? "#3b82f6" : "#22c55e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath(); ctx.arc(320, 200, 120, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.arc(320, 185, 70, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(320, 340, 90, 60, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(type === "vao" ? "📸 ẢNH ĐIỂM DANH VÀO" : "📸 ẢNH ĐIỂM DANH RA", 320, 420);
  ctx.font = "15px monospace"; ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(new Date().toLocaleString("vi-VN"), 320, 450);
  ctx.font = "bold 72px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.save(); ctx.translate(320, 240); ctx.rotate(-0.4);
  ctx.fillText("DEMO", 0, 0); ctx.restore();
  return canvas.toDataURL("image/jpeg", 0.85);
}

// ─── Countdown giây ───────────────────────────────────────────────────────────

function StepCountdown({
  buoi, tiet, onReady,
}: {
  buoi: "sang" | "chieu"; tiet: number; onReady: () => void;
}) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    function calc() {
      const pt = getPeriodTime(buoi, tiet);
      const [ph, pm] = pt.start.split(":").map(Number);
      const openH = ph, openM = pm - 5; // mở cửa sổ 5 phút trước

      const dev = getDevMode();
      if (dev) {
        const [ch, cm] = dev.time.split(":").map(Number);
        const diff = (openH * 60 + openM - ch * 60 - cm) * 60;
        if (diff <= 0) { onReady(); return; }
        setSecs(diff);
      } else {
        const now = new Date();
        const nowS = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const openS = openH * 3600 + openM * 60;
        const diff = openS - nowS;
        if (diff <= 0) { onReady(); return; }
        setSecs(diff);
      }
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [buoi, tiet, onReady]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-surface-container)" strokeWidth="8" />
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-primary)" strokeWidth="8"
            strokeDasharray={`${Math.PI * 2 * 52}`}
            strokeDashoffset={`${Math.PI * 2 * 52 * Math.min(1, secs / 300)}`}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-black text-2xl" style={{ color: "var(--color-primary)" }}>{mm}:{ss}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-outline)" }}>còn lại</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: "var(--color-on-surface)" }}>Chưa đến giờ điểm danh</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Cửa sổ mở trước <strong>5 phút</strong> khi tiết bắt đầu · {getPeriodTime(buoi, tiet).start}
        </p>
      </div>
      <div className="rounded-xl px-5 py-3 text-sm text-center"
        style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
        Trang tự chuyển khi đến giờ · Không cần tải lại
      </div>
    </div>
  );
}

// ─── Camera UI ─────────────────────────────────────────────────────────────────

function StepCamera({ type, onCapture }: { type: "vao" | "ra"; onCapture: (img: string) => void }) {
  const { videoRef, stream, error, ready, start, stop, capture } = useCamera();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => { start(); return () => stop(); }, []);

  function handleCapture() {
    const img = capture();
    if (img) { setPreview(img); stop(); }
  }

  function handleDemoCapture() {
    stop();
    setPreview(generateDemoImage(type));
  }

  function handleRetake() { setPreview(null); start(); }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-sm">
        {!preview && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] w-full">
            {/* Video preview — mirror để tự nhiên như gương */}
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            {!stream && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-white" style={{ fontSize: 40 }}>progress_activity</span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: "#f87171" }}>videocam_off</span>
                <p className="text-white text-sm">{error}</p>
                <button onClick={start} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.2)" }}>Thử lại</button>
              </div>
            )}
            {stream && ready && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-6 rounded-full border-2 border-white opacity-30" />
                <div className="absolute bottom-3 left-0 right-0 text-center text-white text-xs opacity-70">Nhìn thẳng vào camera</div>
              </div>
            )}
          </div>
        )}

        {/* Ảnh đã chụp — KHÔNG mirror: hiển thị như người khác thấy */}
        {preview && (
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full">
            <img src={preview} alt="Ảnh điểm danh" className="w-full h-full object-cover" />
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: "rgba(22,101,52,0.85)" }}>
              <span className="material-symbols-outlined mr-1" style={{ fontSize: 12 }}>check</span>Đã chụp
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          {!preview ? (
            <>
              <button onClick={handleCapture} disabled={!ready || !!error}
                className="flex-1 py-3 rounded-xl font-headline font-bold text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>photo_camera</span>Chụp ảnh
              </button>
              <button onClick={handleDemoCapture}
                className="py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                style={{ background: "#f3e8ff", color: "#7c3aed", border: "1.5px solid #c4b5fd" }}
                title="Dùng ảnh mẫu để demo">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_fix_high</span>Ảnh mẫu
              </button>
            </>
          ) : (
            <>
              <button onClick={handleRetake}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>replay</span>Chụp lại
              </button>
              <button onClick={() => onCapture(preview)}
                className="flex-1 py-3 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: "#166534", color: "white" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>Xác nhận
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Kết quả điểm danh vào ───────────────────────────────────────────────────

function StepResult({ record, onGoToLich }: { record: DiemDanhRecord; onGoToLich: () => void }) {
  const cfg = STATUS_STYLE[record.trang_thai];
  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{ background: cfg.bg }}>
        <span className="material-symbols-outlined" style={{ fontSize: 44, color: cfg.text, fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
      </div>
      <div className="text-center">
        <p className="text-3xl font-headline font-black" style={{ color: cfg.text }}>{cfg.label}</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>{cfg.desc}</p>
        {record.tre_phut != null && record.tre_phut > 0 && (
          <p className="text-sm mt-1 font-semibold" style={{ color: cfg.text }}>Trễ {record.tre_phut} phút</p>
        )}
      </div>
      {record.anh_vao && (
        <div className="w-full max-w-xs rounded-2xl overflow-hidden border-4" style={{ borderColor: cfg.text }}>
          {/* Ảnh kết quả — KHÔNG mirror */}
          <img src={record.anh_vao} alt="Ảnh điểm danh vào" className="w-full" />
        </div>
      )}
      <div className="w-full max-w-xs rounded-xl p-4 space-y-2 text-sm"
        style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
        <div className="flex justify-between">
          <span>Giờ vào:</span>
          <span className="font-mono font-semibold" style={{ color: "var(--color-on-surface)" }}>
            {record.thoi_gian_vao ? new Date(record.thoi_gian_vao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tiết / Lớp:</span>
          <span className="font-semibold" style={{ color: "var(--color-on-surface)" }}>T{record.tiet} – {record.lop}</span>
        </div>
        <div className="flex justify-between">
          <span>Môn:</span>
          <span className="font-semibold" style={{ color: "var(--color-on-surface)" }}>{record.mon}</span>
        </div>
      </div>
      {record.trang_thai !== "vang_mat" && !record.da_diem_danh_ra && (
        <div className="w-full max-w-xs rounded-xl p-3 text-sm text-center"
          style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
          <span className="material-symbols-outlined mr-1" style={{ fontSize: 16, verticalAlign: "middle" }}>info</span>
          Nhớ quay lại <strong>điểm danh ra</strong> cuối tiết!
        </div>
      )}
      <button onClick={onGoToLich}
        className="w-full max-w-xs py-3 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>Về trang lịch dạy
      </button>
    </div>
  );
}

// ─── Điểm danh ra ─────────────────────────────────────────────────────────────

function StepCheckout({ record, onDone }: { record: DiemDanhRecord; onDone: () => void }) {
  const [captured, setCaptured] = useState(false);

  function handleCapture(img: string) {
    updateCheckout(record.id, new Date().toISOString(), img);
    setCaptured(true);
  }

  if (captured) {
    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#dcfce7" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 44, color: "#166534", fontVariationSettings: "'FILL' 1" }}>task_alt</span>
        </div>
        <div className="text-center">
          <p className="text-2xl font-headline font-black" style={{ color: "#166534" }}>Hoàn thành!</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Đã điểm danh ra khỏi lớp</p>
        </div>
        <button onClick={onDone}
          className="py-3 px-8 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>Về trang lịch dạy
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4 text-sm text-center"
        style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
        <p className="font-bold">Điểm danh ra — kết thúc tiết học</p>
        <p className="mt-1 opacity-80">Chụp ảnh xác nhận kết thúc tiết {record.tiet} lớp {record.lop}</p>
      </div>
      <StepCamera type="ra" onCapture={handleCapture} />
    </div>
  );
}

// ─── Trang chính ───────────────────────────────────────────────────────────────

type PageState = "loading" | "countdown" | "camera_in" | "result" | "checkout" | "locked" | "ended" | "done";

export default function DiemDanhPage() {
  const router   = useRouter();
  const params   = useParams();
  const slotId   = Number(params.slotId);

  const [gv, setGv]         = useState<GvAccount | null>(null);
  const [state, setState]   = useState<PageState>("loading");
  const [record, setRecord] = useState<DiemDanhRecord | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  const slot = MOCK_TKB.find((s) => s.id === slotId);

  const evaluate = useCallback(() => {
    if (!slot || !gv) return;
    const time = getCurrentTimeStr();
    setCurrentTime(time);
    const ngay    = getDateForThu(slot.thu);
    const existing = findRecord(slotId, ngay);
    setRecord(existing);

    const phase = getAttendancePhase(slot.buoi, slot.tiet, time);

    if (existing) {
      if (!existing.da_diem_danh_ra && phase.phase === "checkout_ready") { setState("checkout"); return; }
      if (existing.da_diem_danh_ra) { setState("done"); return; }
      setState("result"); return;
    }

    switch (phase.phase) {
      case "too_early":    setState("countdown"); break;
      case "ready":
      case "open":         setState("camera_in"); break;
      case "locked": {
        const rec = createCheckinRecord({
          slot_id: slotId, ma_gv: gv.ma_gv, ho_ten_gv: gv.ho_ten,
          thu: slot.thu, buoi: slot.buoi, tiet: slot.tiet,
          lop: slot.lop, mon: slot.mon, ngay,
          trang_thai: "vang_mat",
          thoi_gian_vao: new Date().toISOString(), tre_phut: 15,
        });
        setRecord(rec); setState("locked"); break;
      }
      case "checkout_ready": setState("ended"); break;
      case "period_ended":   setState("ended"); break;
    }
  }, [slot, gv, slotId]);

  // Auth
  useEffect(() => {
    const session = getGvSession();
    if (!session) { router.replace("/login-gv"); return; }
    if (slot && session.ma_gv !== slot.ma_gv) { router.replace("/lich"); return; }
    setGv(session);
  }, [router, slot]);

  useEffect(() => { if (gv) evaluate(); }, [gv, evaluate]);

  // Redirect về lich kèm toast param
  function goToLich(extraParam?: string) {
    router.push(`/lich${extraParam ? `?ok=${extraParam}` : ""}`);
  }

  function handleCheckin(img: string) {
    if (!gv || !slot) return;
    const time = getCurrentTimeStr();
    const ngay = getDateForThu(slot.thu);
    const phase = getAttendancePhase(slot.buoi, slot.tiet, time);

    let trang_thai: TrangThaiDiemDanh = "dung_gio";
    let tre_phut = 0;
    if (phase.phase === "open") { trang_thai = phase.trang_thai; tre_phut = phase.minutesDelta; }

    const rec = createCheckinRecord({
      slot_id: slotId, ma_gv: gv.ma_gv, ho_ten_gv: gv.ho_ten,
      thu: slot.thu, buoi: slot.buoi, tiet: slot.tiet,
      lop: slot.lop, mon: slot.mon, ngay: getDateForThu(slot.thu),
      trang_thai, thoi_gian_vao: new Date().toISOString(), anh_vao: img, tre_phut,
    });
    setRecord(rec);
    setState("result");
  }

  if (!slot) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--color-surface)" }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "var(--color-error)" }}>Không tìm thấy tiết học</p>
          <Link href="/lich" className="mt-4 inline-flex items-center gap-1 text-sm" style={{ color: "var(--color-primary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>Về lịch dạy
          </Link>
        </div>
      </div>
    );
  }

  const pt = getPeriodTime(slot.buoi, slot.tiet);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: "var(--color-surface-container-lowest)", borderBottom: "1px solid var(--color-outline-variant)" }}>
        <Link href="/lich" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "var(--color-surface-container)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-on-surface)" }}>arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-headline font-bold text-sm" style={{ color: "var(--color-on-surface)" }}>
            Điểm danh Tiết {slot.tiet} — {slot.lop}
          </p>
          <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>
            {slot.mon} · {THU_LABELS[slot.thu]} · {pt.start}–{pt.end}
            {getDevMode() && (
              <span className="ml-2 px-1.5 py-0.5 rounded font-bold" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                DEV {currentTime}
              </span>
            )}
          </p>
        </div>
        {gv && (
          <div className="text-right hidden sm:block shrink-0">
            <p className="text-xs font-semibold" style={{ color: "var(--color-on-surface)" }}>{gv.ho_ten}</p>
            <p className="text-[10px]" style={{ color: "var(--color-outline)" }}>{gv.ma_gv}</p>
          </div>
        )}
      </header>

      <div className="max-w-md mx-auto p-4 lg:p-6">
        {/* Slot info */}
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-4"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 26 }}>class</span>
          </div>
          <div>
            <p className="font-headline font-bold text-lg leading-tight">{slot.mon} — {slot.lop}</p>
            <p className="text-sm opacity-80">{THU_LABELS[slot.thu]} · Tiết {slot.tiet} ({slot.buoi === "sang" ? "Sáng" : "Chiều"})</p>
            <p className="text-sm opacity-80 font-mono">{pt.start} – {pt.end}</p>
          </div>
        </div>

        {/* State machine */}
        {state === "loading" && (
          <div className="flex justify-center py-12">
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: 40, color: "var(--color-outline)" }}>progress_activity</span>
          </div>
        )}

        {state === "countdown" && (
          <StepCountdown buoi={slot.buoi} tiet={slot.tiet} onReady={evaluate} />
        )}

        {state === "camera_in" && (
          <div className="space-y-4">
            <div className="rounded-xl p-4 text-sm text-center"
              style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)", border: "1px solid var(--color-primary)" }}>
              <p className="font-bold">Điểm danh vào — bắt đầu tiết học</p>
              <p className="mt-1 opacity-80">Chụp ảnh mặt để xác nhận hiện diện</p>
            </div>
            <StepCamera type="vao" onCapture={handleCheckin} />
          </div>
        )}

        {state === "result" && record && (
          <StepResult record={record} onGoToLich={() => goToLich(record.trang_thai)} />
        )}

        {state === "checkout" && record && (
          <StepCheckout record={record} onDone={() => goToLich("checkout_ok")} />
        )}

        {state === "locked" && record && (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 44, color: "#991b1b", fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-black" style={{ color: "#991b1b" }}>Đã khoá điểm danh</p>
              <p className="text-sm mt-2" style={{ color: "var(--color-on-surface-variant)" }}>
                Quá 15 phút — hệ thống đã ghi nhận <strong>vắng mặt</strong>.
              </p>
            </div>
            <div className="w-full rounded-xl p-4 text-sm"
              style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
              <p className="font-semibold mb-1" style={{ color: "var(--color-on-surface)" }}>Cần giải trình?</p>
              <p>Bạn có thể nhập lý do ngay từ trang <strong>Lịch dạy</strong> của mình.</p>
            </div>
            <button onClick={() => goToLich("vang_mat")}
              className="py-3 px-8 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>Về lịch dạy
            </button>
          </div>
        )}

        {state === "ended" && (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "var(--color-surface-container)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 44, color: "var(--color-outline)" }}>event_busy</span>
            </div>
            <div className="text-center">
              <p className="text-xl font-headline font-black" style={{ color: "var(--color-on-surface)" }}>Tiết học đã kết thúc</p>
              <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Không thể điểm danh sau khi tiết học đã kết thúc</p>
            </div>
            <button onClick={() => router.push("/lich")}
              className="py-3 px-8 rounded-xl font-headline font-bold"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>Về lịch dạy</button>
          </div>
        )}

        {state === "done" && record && (
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#dcfce7" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 44, color: "#166534", fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline font-black" style={{ color: "#166534" }}>Đã điểm danh đầy đủ</p>
              <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Cả vào và ra tiết đã được ghi nhận</p>
            </div>
            <div className="w-full rounded-xl p-4 space-y-2 text-sm"
              style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className="font-semibold" style={{ color: STATUS_STYLE[record.trang_thai].text }}>
                  {STATUS_STYLE[record.trang_thai].label}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giờ vào:</span>
                <span className="font-mono font-semibold" style={{ color: "var(--color-on-surface)" }}>
                  {record.thoi_gian_vao ? new Date(record.thoi_gian_vao).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Giờ ra:</span>
                <span className="font-mono font-semibold" style={{ color: "var(--color-on-surface)" }}>
                  {record.thoi_gian_ra ? new Date(record.thoi_gian_ra).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </span>
              </div>
            </div>
            <button onClick={() => router.push("/lich")}
              className="py-3 px-8 rounded-xl font-headline font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>calendar_today</span>Về lịch dạy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
