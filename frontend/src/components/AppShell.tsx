"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import AuthGuard from "./AuthGuard";

const navigation = [
  { href: "/", label: "Tổng quan", short: "" },
  { href: "/employees", label: "Nhân viên", short: "" },
  { href: "/departments", label: "Phòng ban", short: "" },
  { href: "/attendance", label: "Chấm công", short: "" },
  { href: "/leaves", label: "Nghỉ phép", short: "" },
  { href: "/payroll", label: "Bảng lương", short: "" },
  { href: "/users", label: "Tài khoản", short: "TK", adminOnly: true },
];

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function AppShell({
  title,
  description,
  children,
  action,
}: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.roles.includes("ADMIN") ?? false;

  return (
    <AuthGuard>
      <div className="appShell">
        <aside className="sidebar">
          <Link className="brand" href="/" title="Về trang tổng quan">
            <span className="brandMark">NS</span>
            <span>
              <strong>Quản lý nhân sự</strong>
            </span>
          </Link>

          <p className="navLabel">Quản lý</p>

          <nav className="navigation" aria-label="Điều hướng chính">
            {navigation
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    className={active ? "navItem active" : "navItem"}
                    href={item.href}
                    key={item.href}
                    title={`Mở ${item.label.toLowerCase()}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.short}</span>
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="sidebarFooter">
            <div className="userAvatar">
              {(session?.user?.name ?? "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{session?.user?.name ?? "Người dùng"}</strong>
              <small>{isAdmin ? "Quản trị viên" : "Nhân viên"}</small>
            </div>
            <button
              className="logoutButton"
              type="button"
              title="Đăng xuất khỏi hệ thống"
              aria-label="Đăng xuất khỏi hệ thống"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              Thoát
            </button>
          </div>
        </aside>

        <main className="mainArea">
          <header className="pageHeader">
            <div>
              <p className="eyebrow">Hệ thống quản lý nhân sự</p>
              <h1>{title}</h1>
              <p className="pageDescription">{description}</p>
            </div>
            {action && <div className="headerAction">{action}</div>}
          </header>
          <div className="pageContent">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
