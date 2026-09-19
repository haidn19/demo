"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import EmployeeForm from "@/components/EmployeeForm";
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
      .catch(() => setError("Cannot load employee."));
  }, [employeeId, router, session, status]);

  async function handleUpdate(employeeData: EmployeeRequest) {
    await updateEmployee(employeeId, employeeData);
    router.push("/employees");
  }

  return (
    <AuthGuard>
      <main className="container narrow">
        <Link href="/employees">← Back</Link>
        <h1>Edit Employee</h1>
        {error && <p className="error">{error}</p>}
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
            }}
            submitLabel="Update"
            onSubmit={handleUpdate}
          />
        )}
      </main>
    </AuthGuard>
  );
}
