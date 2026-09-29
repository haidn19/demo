import AppShell from "@/components/AppShell";
import DepartmentManager from "@/components/departments/DepartmentManager";

export default function DepartmentsPage() {
  return (
    <AppShell
      title="Phòng ban"
      description="Theo dõi cơ cấu tổ chức, quy mô và người phụ trách từng đơn vị."
    >
      <DepartmentManager />
    </AppShell>
  );
}
