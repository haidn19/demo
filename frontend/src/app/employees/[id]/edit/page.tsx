"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppShell from "@/components/AppShell";
import EmployeeForm from "@/components/EmployeeForm";
import PageState from "@/components/ui/PageState";
import { getEmployee, updateEmployee } from "@/services/employeeService";
import type { Employee, EmployeeRequest } from "@/types/employee";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const employeeId = Number(id);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && !session.roles.includes("ADMIN")) {
      router.replace("/employees");
      return;
    }

    if (status !== "authenticated" || !session.roles.includes("ADMIN")) return;

    getEmployee(employeeId)
      .then(setEmployee)
      .catch(() => setError("Không thể tải hồ sơ nhân viên."));
  }, [employeeId, router, session, status]);

  async function handleUpdate(employeeData: EmployeeRequest) {
    await updateEmployee(employeeId, employeeData);
    router.push("/employees");
  }

  return (
    <AppShell
      title="Cập nhật nhân viên"
      description="Chỉnh sửa thông tin hồ sơ và chính sách nhân sự."
      action={<Link className="button" href="/employees" title="Quay lại danh sách nhân viên">← Quay lại</Link>}
    >
      <div className="contentNarrow">
        {error && <PageState type="error" title="Không thể tải hồ sơ" description={error} />}
        {employee && (
          <EmployeeForm
            initialValues={{
              name: employee.name,
              dateOfBirth: employee.dateOfBirth ?? "",
              phoneNumber: employee.phoneNumber ?? "",
              address: employee.address ?? "",
              email: employee.email ?? "",
              taxCode: employee.taxCode ?? "",
              departmentId: employee.department?.id ?? null,
              baseSalary: employee.baseSalary ?? 0,
              LeaveDays: employee.remainingLeaveDays ?? 0,
            }}
            submitLabel="Lưu thay đổi"
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </AppShell>
  );
}
