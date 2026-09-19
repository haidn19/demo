"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
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
    <AuthGuard>
      <main className="container narrow">
        <Link href="/employees">← Back</Link>
        <h1>Add Employee</h1>
        {allowed && (
          <EmployeeForm submitLabel="Create" onSubmit={handleCreate} />
        )}
      </main>
    </AuthGuard>
  );
}
