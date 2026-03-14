export default function ImportPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-headline font-extrabold" style={{ color: "var(--color-primary)" }}>
          Import dữ liệu từ Excel
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
          Tải lên file mẫu để cập nhật dữ liệu giáo viên, lớp học, môn học và phòng học.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-3xl p-8 lg:p-10 text-center"
        style={{
          borderColor: "var(--color-outline-variant)",
          background: "var(--color-surface-container-low)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--color-primary)" }}>
          cloud_upload
        </span>
        <h2 className="mt-3 text-lg font-headline font-bold" style={{ color: "var(--color-on-surface)" }}>
          Kéo thả file .xlsx vào đây
        </h2>
        <p className="text-sm mt-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
          Hoặc bấm nút bên dưới để chọn file từ máy tính
        </p>
        <button
          className="mt-5 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 inline-flex items-center gap-2"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>folder_open</span>
          Chọn file Excel
        </button>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 gap-5">
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--color-surface-container-lowest)",
            boxShadow: "0 2px 8px rgba(30,58,138,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>checklist</span>
            <h3 className="font-headline font-bold text-base" style={{ color: "var(--color-on-surface)" }}>
              Quy tắc kiểm tra
            </h3>
          </div>
          <ul className="space-y-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            {[
              "Mã giáo viên không được trùng",
              "Sĩ số lớp là số nguyên dương",
              "Tên môn học phải đúng danh mục",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: 16, color: "var(--color-primary)" }}>
                  check_circle
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--color-surface-container-lowest)",
            boxShadow: "0 2px 8px rgba(30,58,138,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--color-primary)" }}>history</span>
            <h3 className="font-headline font-bold text-base" style={{ color: "var(--color-on-surface)" }}>
              Kết quả import gần nhất
            </h3>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "green" }}>check_circle</span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-on-surface)" }}>124 dòng hợp lệ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-error)" }}>error</span>
              <span className="text-sm font-semibold" style={{ color: "var(--color-error)" }}>3 dòng lỗi</span>
            </div>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 flex items-center gap-1.5"
            style={{ background: "var(--color-surface-container-high)", color: "var(--color-on-surface)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
            Tải log lỗi
          </button>
        </div>
      </div>
    </div>
  );
}
