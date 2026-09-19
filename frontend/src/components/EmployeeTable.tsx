"use client";

import Link from "next/link";
import type { Employee } from "@/types/employee";
import RoleGuard from "./RoleGuard";
import { deleteEmployee } from "@/services/employeeService";
import { useSession } from "next-auth/react";

interface Props {
  employees: Employee[];
  reload: () => Promise<void>;
}

export default function EmployeeTable({ employees, reload }: Props) {
  const { data: session } = useSession();
  const isAdmin = session?.roles.includes("ADMIN") ?? false;
  async function handleDelete(employee: Employee) {
    if (!window.confirm(`Delete ${employee.name}?`)) return;

    try {
      await deleteEmployee(employee.id);
      await reload();
    } catch {
      alert("Delete failed. Check ADMIN permission on backend.");
    }
  }

  if (employees.length === 0) {
    return <div className="card">No employees found.</div>;
  }

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            {isAdmin && <th>Date of birth</th>}
            {isAdmin && <th>Phone</th>}
            {isAdmin && <th>Address</th>}
            {isAdmin && <th>Email</th>}
            {isAdmin && <th>Tax code</th>}
            {isAdmin && <th>Department</th>}
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              {isAdmin && <td>{employee.dateOfBirth ?? "-"}</td>}
              {isAdmin && <td>{employee.phoneNumber ?? "-"}</td>}
              {isAdmin && <td>{employee.address ?? "-"}</td>}
              {isAdmin && <td>{employee.email ?? "-"}</td>}
              {isAdmin && <td>{employee.taxCode ?? "-"}</td>}
              {isAdmin && <td>{employee.department?.name ?? "-"}</td>}
              {isAdmin && (
                <td className="actions">
                  <RoleGuard role="ADMIN">
                    <Link
                      className="button"
                      href={`/employees/${employee.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="button danger"
                      type="button"
                      onClick={() => handleDelete(employee)}
                    >
                      Delete
                    </button>
                  </RoleGuard>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
