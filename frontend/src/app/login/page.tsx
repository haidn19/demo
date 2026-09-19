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
      await router.replace("/employees");
    } catch {
      setError("Login failed. Check username/password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="loginPage">
      <form className="card loginCard" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="muted">Login with your Spring Boot account.</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="error">{error}</p>}

        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
