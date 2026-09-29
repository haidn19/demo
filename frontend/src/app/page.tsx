"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AppShell from "@/components/AppShell";
import { getDepartments } from "@/services/departmentService";
import { getEmployees } from "@/services/employeeService";

const modules = [
  { href: "/employees", number: "01", title: "Nhân viên", text: "Hồ sơ và thông tin nhân sự" },
  { href: "/departments", number: "02", title: "Phòng ban", text: "Cơ cấu và người phụ trách" },
  { href: "/attendance", number: "03", title: "Chấm công", text: "Giờ vào, giờ ra và công tháng" },
  { href: "/leaves", number: "04", title: "Nghỉ phép", text: "Tạo và xử lý đơn nghỉ" },
  { href: "/payroll", number: "05", title: "Bảng lương", text: "Tổng hợp lương theo kỳ" },
];

export default function HomePage() {
  const { data: session } = useSession();
  const isAdmin = session?.roles.includes("ADMIN") ?? false;
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [departmentCount, setDepartmentCount] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getEmployees(), getDepartments()])
      .then(([employees, departments]) => {
        setEmployeeCount(employees.length);
        setDepartmentCount(departments.length);
      })
      .catch(() => {
        setEmployeeCount(0);
        setDepartmentCount(0);
      });
  }, []);

  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <AppShell
      title={`Chào ${session?.user?.name ?? "bạn"}`}
      description={`Hôm nay là ${today}. Đây là tổng quan hệ thống của bạn.`}
    >
      <section className="statsGrid">
        <article className="statCard accentCard">
          <span className="statLabel">Tổng nhân viên</span>
          <strong>{employeeCount ?? "—"}</strong>
          <small>Hồ sơ trên hệ thống</small>
        </article>
        <article className="statCard">
          <span className="statLabel">Phòng ban</span>
          <strong>{departmentCount ?? "—"}</strong>
          <small>Đơn vị đang hoạt động</small>
        </article>
        <article className="statCard">
          <span className="statLabel">Vai trò của bạn</span>
          <strong className="statText">
            {isAdmin ? "Quản trị" : "Nhân viên"}
          </strong>
          <small>Quyền truy cập hiện tại</small>
        </article>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Truy cập nhanh</p>
            <h2>Các phân hệ</h2>
          </div>
        </div>
        <div className="moduleGrid">
          {modules.map((module) => (
            <Link className="moduleCard" href={module.href} key={module.href}>
              <span>{module.number}</span>
              <div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </div>
              <b>→</b>
            </Link>
          ))}
          {isAdmin && (
            <Link className="moduleCard" href="/users">
              <span>06</span>
              <div>
                <h3>Tài khoản</h3>
                <p>Quyền truy cập và trạng thái</p>
              </div>
              <b>→</b>
            </Link>
          )}
        </div>
      </section>
    </AppShell>
  );
}
