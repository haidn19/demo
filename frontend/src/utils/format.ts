export function toDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const dateOnly = value.slice(0, 10).split("-");
  if (dateOnly.length !== 3) return value;
  return `${dateOnly[2]}/${dateOnly[1]}/${dateOnly[0]}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const absolute = Math.abs(value);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  const duration = hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
  return value < 0 ? `Dư ${duration}` : duration;
}
