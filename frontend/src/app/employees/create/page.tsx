"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppShell from "@/components/AppShell";
import EmployeeForm from "@/components/EmployeeForm";
import { createEmployee } from "@/services/employeeService";
import type { EmployeeRequest } from "@/types/employee";

export default function CreateEmployeePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !session.roles.includes("ADMIN")) {
      router.replace("/employees");
      return;
    }
  }, [router, session, status]);

  const allowed = status === "authenticated" && session.roles.includes("ADMIN");

  async function handleCreate(employee: EmployeeRequest) {
    await createEmployee(employee);
    router.push("/employees");
  }

  return (
    <AppShell
      title="Thêm nhân viên"
      description="Tạo hồ sơ nhân sự mới và phân công vào phòng ban."
      action={<Link className="button" href="/employees" title="Quay lại danh sách nhân viên">← Quay lại</Link>}
    >
      <div className="contentNarrow">
        {allowed && (
          <EmployeeForm submitLabel="Tạo nhân viên" onSubmit={handleCreate} />
        )}
      </div>
    </AppShell>
  );
}
