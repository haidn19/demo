import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload, Role } from "@/types/auth";

function normalizeRoles(payload: JwtPayload): Role[] {
  const rawRoles = [
    ...(Array.isArray(payload.roles)
      ? payload.roles
      : payload.roles
        ? [payload.roles]
        : []),
    ...(payload.authorities ?? []),
    ...(payload.scope ? payload.scope.split(" ") : []),
  ];

  return rawRoles
    .map((role) => role.toUpperCase().replace(/^ROLE_/, ""))
    .map((role) => (role === "USER" ? "STAFF" : role))
    .filter((role): role is Role => role === "STAFF" || role === "ADMIN");
}

export const authOptions: NextAuthOptions = {
  // Lưu session bằng JWT để không cần tạo session record trong database.
  session: { strategy: "jwt" },
  providers: [
    // Credentials provider chuyển username/password đến backend để xác thực.
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // authorize phải trả về user hợp lệ hoặc null nếu thông tin đăng nhập sai.
        const username = credentials?.username;
        const password = credentials?.password;

        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        // Chờ backend phản hồi trước khi kiểm tra kết quả đăng nhập.
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          },
        );

        if (!response.ok) return null;

        // Đọc JSON bất đồng bộ rồi lấy JWT do backend trả về.
        const result = (await response.json()) as { token?: string };
        if (!result.token) return null;

        const payload = jwtDecode<JwtPayload>(result.token);
        return {
          id: payload.sub,
          name: payload.sub,
          accessToken: result.token,
          roles: normalizeRoles(payload),
        };
      },
    }),
  ],
  callbacks: {
    // Đưa access token và roles của user vào JWT NextAuth.
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.roles = user.roles;
      }
      return token;
    },
    // Chép dữ liệu từ JWT vào session để client có thể sử dụng.
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.roles = token.roles ?? [];
      return session;
    },
  },
};
