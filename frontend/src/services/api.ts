import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// Tạo một Axios instance dùng chung để mọi request có cùng URL gốc và header.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor chạy trước mỗi request, dùng để lấy session và gắn access token.
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = session?.accessToken;

  if (token) {
    // Tự động gắn JWT vào mọi request cần xác thực gửi đến backend.
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor chạy sau response; nếu token hết hạn thì đưa người dùng về trang đăng nhập.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      void signOut({ callbackUrl: "/login" });
    }

    return Promise.reject(error);
  },
);

export default api;
