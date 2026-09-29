import type { Employee } from "@/types/employee";

interface Props {
  employees: Employee[];
  value: number | "";
  onChange: (employeeId: number | "") => void;
  id?: string;
  required?: boolean;
  getOptionLabel?: (employee: Employee) => string;
}

export default function EmployeeSelect({
  employees,
  value,
  onChange,
  id = "employeeId",
  required = true,
  getOptionLabel = (employee) => employee.name,
}: Props) {
  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(event) =>
        onChange(event.target.value ? Number(event.target.value) : "")
      }
    >
      <option value="">Chọn nhân viên</option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {getOptionLabel(employee)}
        </option>
      ))}
    </select>
  );
}
