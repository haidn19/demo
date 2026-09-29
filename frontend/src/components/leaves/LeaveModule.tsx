"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getEmployees } from "@/services/employeeService";
import { getLeaves } from "@/services/leaveService";
import type { Employee } from "@/types/employee";
import type { Leave } from "@/types/modules";
import PageState from "@/components/ui/PageState";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveList from "./LeaveList";

export default function LeaveModule() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");

  async function loadLeaves() {
    try {
      setLoadingLeaves(true);
      setListError("");
      setLeaves(await getLeaves());
    } catch {
      setListError("Không thể tải danh sách đơn nghỉ phép. Hãy kiểm tra backend đã khởi động.");
    } finally {
      setLoadingLeaves(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      getEmployees()
        .then(setEmployees)
        .catch(() => setFormError("Không thể tải danh sách nhân viên."));
      void loadLeaves();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function addLeave(leave: Leave) {
    setFormError("");
    setLeaves((current) => [leave, ...current]);
  }

  function updateLeave(updated: Leave) {
    setListError("");
    setLeaves((current) => current.map((leave) => leave.id === updated.id ? updated : leave));
  }

  const isAdmin = session?.roles.includes("ADMIN") ?? false;
  const pendingCount = leaves.filter((leave) => leave.status === "PENDING").length;

  return (
    <div className="moduleStack">
      <div className="singleColumn">
        <LeaveRequestForm employees={employees} onSuccess={addLeave} onError={setFormError} />
      </div>
      {formError && <PageState type="error" title="Không thể tạo đơn" description={formError} />}

      <section className="moduleStack">
        <div className="sectionToolbar">
          <div>
            <p className="eyebrow">Danh sách đơn</p>
            <h2 className="sectionTitle">Đơn nghỉ phép</h2>
          </div>
          <div className="actions">
            <span className="roleNote">{pendingCount} đơn chờ duyệt</span>
            <button className="button small" type="button" title="Cập nhật danh sách đơn nghỉ phép" onClick={() => void loadLeaves()} disabled={loadingLeaves}>
              {loadingLeaves ? "Đang tải..." : "Tải lại"}
            </button>
          </div>
        </div>
        {listError && <PageState type="error" title="Không thể tải danh sách" description={listError} />}
        {loadingLeaves && <PageState type="loading" title="Đang tải đơn nghỉ phép" />}
        {!loadingLeaves && !listError && leaves.length === 0 && (
          <PageState title="Chưa có đơn nghỉ phép" description="Đơn mới tạo sẽ được hiển thị tại đây." />
        )}
        {!loadingLeaves && !listError && leaves.length > 0 && (
          <LeaveList leaves={leaves} canReview={isAdmin} onChange={updateLeave} onError={setListError} />
        )}
      </section>
    </div>
  );
}
