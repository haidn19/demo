"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import EmployeeTable from "@/components/EmployeeTable";
import PageState from "@/components/ui/PageState";
import RoleGuard from "@/components/RoleGuard";
import { getEmployees } from "@/services/employeeService";
import type { Employee } from "@/types/employee";
import { useSession } from "next-auth/react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session } = useSession();

  async function loadEmployees() {
    try {
      setError("");
      const data = await getEmployees();
      setEmployees(data);
    } catch {
      setError(
        "Không thể tải danh sách nhân viên. Vui lòng kiểm tra kết nối API và quyền truy cập.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEmployees(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AppShell
      title="Nhân viên"
      description="Quản lý hồ sơ, thông tin liên hệ và chính sách của nhân viên."
      action={
        <RoleGuard role="ADMIN">
          <Link className="button primary" href="/employees/create" title="Tạo hồ sơ nhân viên mới">
            + Thêm nhân viên
          </Link>
        </RoleGuard>
      }
    >
        <div className="sectionToolbar">
          <p className="muted">
            {loading ? "Đang cập nhật danh sách..." : `${employees.length} hồ sơ nhân viên`}
          </p>
          <span className="roleNote">
            Quyền: {session?.roles?.includes("ADMIN") ? "Quản trị" : "Nhân viên"}
          </span>
        </div>

        {loading && <PageState type="loading" title="Đang tải nhân viên" />}
        {error && <PageState type="error" title="Không thể tải dữ liệu" description={error} />}
        {!loading && !error && (
          <EmployeeTable employees={employees} reload={loadEmployees} />
        )}
    </AppShell>
  );
}
