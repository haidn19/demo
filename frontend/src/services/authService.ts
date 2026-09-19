import api from "./api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

// async cho phép hàm trả về Promise; await đợi Axios nhận response từ backend.
export async function login(data: LoginRequest): Promise<LoginResponse> {
  // API layer chỉ xử lý request; page sẽ quyết định điều hướng sau khi đăng nhập.
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}
