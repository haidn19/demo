"use client";

import Link from "next/link";
import type { Employee } from "@/types/employee";
import RoleGuard from "./RoleGuard";
import { deleteEmployee } from "@/services/employeeService";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { formatCurrency, formatDate } from "@/utils/format";

interface Props {
  employees: Employee[];
  reload: () => Promise<void>;
}

export default function EmployeeTable({ employees, reload }: Props) {
  const { data: session } = useSession();
  const isAdmin = session?.roles.includes("ADMIN") ?? false;
  const [deletingId, setDeletingId] = useState<number | null>(null);
  async function handleDelete(employee: Employee) {
    if (!window.confirm(`Xóa hồ sơ của ${employee.name}?`)) return;

    try {
      setDeletingId(employee.id);
      await deleteEmployee(employee.id);
      await reload();
    } catch {
      alert("Không thể xóa nhân viên. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  if (employees.length === 0) {
    return <div className="card">Chưa có nhân viên nào.</div>;
  }

  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Nhân viên</th>
            {isAdmin && <th>Liên hệ</th>}
            {isAdmin && <th>Phòng ban</th>}
            {isAdmin && <th>Lương cơ bản</th>}
            {isAdmin && <th>Phép còn lại</th>}
            {isAdmin && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <strong>{employee.name}</strong>
                {isAdmin && (
                  <span className="tableMeta">
                    Sinh ngày {formatDate(employee.dateOfBirth)} · MST {employee.taxCode ?? "—"}
                  </span>
                )}
              </td>
              {isAdmin && (
                <td>
                  {employee.phoneNumber ?? "—"}
                  <span className="tableMeta">{employee.email ?? "Chưa có email"}</span>
                </td>
              )}
              {isAdmin && <td>{employee.department?.name ?? "—"}</td>}
              {isAdmin && <td>{formatCurrency(employee.baseSalary)}</td>}
              {isAdmin && <td>{employee.remainingLeaveDays ?? 0} ngày</td>}
              {isAdmin && (
                <td className="actions">
                  <RoleGuard role="ADMIN">
                    <Link
                      className="button"
                      href={`/employees/${employee.id}/edit`}
                      title={`Chỉnh sửa hồ sơ của ${employee.name}`}
                    >
                      Sửa
                    </Link>
                    <button
                      className="button danger"
                      type="button"
                      aria-label={`Xóa nhân viên ${employee.name}`}
                      title={`Xóa nhân viên ${employee.name}`}
                      disabled={deletingId === employee.id}
                      onClick={() => handleDelete(employee)}
                    >
                      {deletingId === employee.id ? "Đang xóa..." : "Xóa"}
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
