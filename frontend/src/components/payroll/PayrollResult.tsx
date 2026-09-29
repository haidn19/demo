import type { Payroll } from "@/types/modules";
import { formatCurrency, formatDate, formatMinutes } from "@/utils/format";

export default function PayrollResult({ payroll }: { payroll: Payroll }) {
  return (
    <section className="card payrollResult">
      <div className="resultHeader">
        <div>
          <p className="eyebrow">Kết quả tính lương</p>
          <h2>
            Kỳ {formatDate(payroll.fromDate)} — {formatDate(payroll.toDate)}
          </h2>
        </div>
        <span
          className={
            payroll.deductionRequired
              ? "statusBadge status-rejected"
              : "statusBadge status-approved"
          }
        >
          {payroll.deductionRequired ? "Có khấu trừ" : "Đủ công"}
        </span>
      </div>
      <div className="salaryHero">
        <span>Thực nhận dự kiến</span>
        <strong>{formatCurrency(payroll.totalSalary)}</strong>
      </div>
      <div className="detailGrid payrollGrid">
        <div>
          <span>Lương cơ bản</span>
          <strong>{formatCurrency(payroll.baseSalary)}</strong>
        </div>
        <div>
          <span>Ngày công hưởng lương</span>
          <strong>{payroll.paidDays} ngày</strong>
        </div>
        <div>
          <span>Lương theo công</span>
          <strong>{formatCurrency(payroll.salary)}</strong>
        </div>
        <div>
          <span>Tiền làm thêm</span>
          <strong>{formatCurrency(payroll.overtimePay)}</strong>
        </div>
        <div>
          <span>Ngày phép đã dùng</span>
          <strong>{payroll.leaveDaysUsed} ngày</strong>
        </div>
      </div>
    </section>
  );
}
