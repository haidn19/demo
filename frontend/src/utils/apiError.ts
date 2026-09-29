import axios from "axios";

interface ApiErrorBody {
  message?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (isApiErrorBody(data) && data.message) return data.message;
    if (!error.response) return "Không thể kết nối đến backend. Hãy kiểm tra backend đang chạy ở cổng 8080.";
  }

  return fallback;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && "message" in value;
}
