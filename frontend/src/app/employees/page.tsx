"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import EmployeeTable from "@/components/EmployeeTable";
import RoleGuard from "@/components/RoleGuard";
import { getEmployees } from "@/services/employeeService";
import type { Employee } from "@/types/employee";
import { signOut, useSession } from "next-auth/react";

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
        "Cannot load employees. Check backend URL, CORS and token permissions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEmployees(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleLogout() {
    void signOut({ callbackUrl: "/login" });
  }

  return (
    <AuthGuard>
      <main className="container">
        <div className="topbar">
          <div>
            <h1>Employee Management</h1>
            <p className="muted">
              Role: {session?.roles?.join(", ") || "unknown"}
            </p>
          </div>

          <div className="actions">
            <Link className="button" href="/departments">
              Phòng ban
            </Link>
            <RoleGuard role="ADMIN">
              <Link className="button primary" href="/employees/create">
                + Add Employee
              </Link>
            </RoleGuard>
            <button className="button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {loading && <div className="card">Loading...</div>}
        {error && <div className="card error">{error}</div>}
        {!loading && !error && (
          <EmployeeTable employees={employees} reload={loadEmployees} />
        )}
      </main>
    </AuthGuard>
  );
}
