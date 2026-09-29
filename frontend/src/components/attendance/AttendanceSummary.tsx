import type { Attendance } from "@/types/modules";
import { formatDateTime, formatMinutes } from "@/utils/format";
import StatusBadge from "@/components/ui/StatusBadge";

export default function AttendanceSummary({ record }: { record: Attendance }) {
  return (
    <section className="card resultCard">
      <div className="resultHeader">
        <div>
          <p className="eyebrow">Kết quả trong ngày</p>
          <h2>Ngày {record.workDate}</h2>
        </div>
        <StatusBadge status={record.status} />
      </div>
      <div className="detailGrid">
        <div><span>Giờ vào</span><strong>{formatDateTime(record.checkIn)}</strong></div>
        <div><span>Giờ ra</span><strong>{formatDateTime(record.checkOut)}</strong></div>
        <div><span>Thời gian làm</span><strong>{formatMinutes(record.workingMinutes)}</strong></div>
        <div><span>Làm thêm</span><strong>{formatMinutes(record.overtimeMinutes)}</strong></div>
        <div><span>Đi muộn</span><strong>{formatMinutes(record.lateMinutes)}</strong></div>
        <div><span>Về sớm</span><strong>{formatMinutes(record.earlyLeaveMinutes)}</strong></div>
      </div>
    </section>
  );
}
