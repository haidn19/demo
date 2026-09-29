import AppShell from "@/components/AppShell";
import AttendanceModule from "@/components/attendance/AttendanceModule";

export default function AttendancePage() {
  return (
    <AppShell
      title="Chấm công"
      description="Ghi nhận giờ làm, tra cứu công ngày và theo dõi cân đối công tháng."
    >
      <AttendanceModule />
    </AppShell>
  );
}
