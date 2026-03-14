import type { CanhBao, DinhMuc, GiaoVien, PhanCong, RangBuoc, TKBSlot } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(path: string, method: HttpMethod = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${method} ${path} failed: ${response.status} ${text}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Giáo viên
export const getGiaoVienList = () => request<GiaoVien[]>("/api/giao-vien");
export const getGiaoVienByMa = (ma_gv: string) => request<GiaoVien>(`/api/giao-vien/${ma_gv}`);
export const createGiaoVien = (payload: Partial<GiaoVien>) => request<GiaoVien>("/api/giao-vien", "POST", payload);
export const updateGiaoVien = (ma_gv: string, payload: Partial<GiaoVien>) =>
  request<GiaoVien>(`/api/giao-vien/${ma_gv}`, "PUT", payload);
export const deleteGiaoVien = (ma_gv: string) => request<void>(`/api/giao-vien/${ma_gv}`, "DELETE");

// Phân công
export const getPhanCongList = () => request<PhanCong[]>("/api/phan-cong");
export const getPhanCongByMaGv = (ma_gv: string) => request<PhanCong[]>(`/api/phan-cong/${ma_gv}`);
export const createPhanCong = (payload: Partial<PhanCong>) => request<PhanCong>("/api/phan-cong", "POST", payload);
export const updatePhanCong = (id: number, payload: Partial<PhanCong>) =>
  request<PhanCong>(`/api/phan-cong/${id}`, "PUT", payload);
export const deletePhanCong = (id: number) => request<void>(`/api/phan-cong/${id}`, "DELETE");

// Định mức
export const getDinhMucList = () => request<DinhMuc[]>("/api/dinh-muc");
export const updateDinhMucBulk = (payload: DinhMuc[]) => request<DinhMuc[]>("/api/dinh-muc", "PUT", payload);

// Ràng buộc
export const getRangBuocList = () => request<RangBuoc[]>("/api/rang-buoc");
export const createRangBuoc = (payload: Partial<RangBuoc>) => request<RangBuoc>("/api/rang-buoc", "POST", payload);
export const deleteRangBuoc = (id: number) => request<void>(`/api/rang-buoc/${id}`, "DELETE");

// Import
export interface ImportPreviewResponse {
  giao_vien: GiaoVien[];
  phan_cong: PhanCong[];
  errors: string[];
}
export const importPreview = (payload: unknown) =>
  request<ImportPreviewResponse>("/api/import/preview", "POST", payload);
export const importConfirm = (payload: unknown) =>
  request<{ success: boolean }>("/api/import/confirm", "POST", payload);

// TKB
export const getTKBList = () => request<TKBSlot[]>("/api/tkb");
export const getTKBByMaGv = (ma_gv: string) => request<TKBSlot[]>(`/api/tkb/gv/${ma_gv}`);
export const generateTKB = () => request<{ job_id: string }>("/api/tkb/generate", "POST");
export const getTKBStatus = (jobId: string) =>
  request<{ status: "running" | "done" | "failed"; progress: number; log: string[] }>(`/api/tkb/status/${jobId}`);
export const updateTKBSlot = (payload: { slot: TKBSlot }) =>
  request<{ slot: TKBSlot; canh_bao: CanhBao[] }>("/api/tkb/slot", "PUT", payload);
export const validateTKB = () => request<CanhBao[]>("/api/tkb/validate");
export const getTKBSummary = () =>
  request<{ so_gv: number; so_lop: number; so_rang_buoc: number; so_phan_cong: number }>("/api/tkb/summary");

// Chat
export const chatWithAI = (payload: { message: string; context?: unknown }) =>
  request<{ reply: string; action?: "add_constraint" | "regenerate" | null }>("/api/chat", "POST", payload);
