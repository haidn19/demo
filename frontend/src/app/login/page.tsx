"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm async cho phép chờ NextAuth xác thực xong trước khi chuyển trang.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      // signIn gọi Credentials provider; redirect=false để tự xử lý kết quả.
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result?.ok) throw new Error("Invalid credentials");

      // Chỉ chuyển đến danh sách nhân viên sau khi đăng nhập thành công.
      await router.replace("/");
    } catch {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra tài khoản và mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="loginPage">
      <form className="loginCard" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>

        <label htmlFor="username">Tên đăng nhập</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          placeholder="Nhập tên đăng nhập"
          required
        />

        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="button primary" type="submit" title="Đăng nhập vào hệ thống quản lý nhân sự" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
