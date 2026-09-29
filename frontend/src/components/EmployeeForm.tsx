"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { Department, EmployeeRequest } from "@/types/employee";
import { getDepartments } from "@/services/employeeService";

interface Props {
  initialValues?: Partial<EmployeeRequest>;
  submitLabel: string;
  onSubmit: (employee: EmployeeRequest) => Promise<void>;
}

export default function EmployeeForm({
  initialValues = {},
  submitLabel,
  onSubmit,
}: Props) {
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeRequest>({
    defaultValues: {
      name: initialValues.name ?? "",
      dateOfBirth: initialValues.dateOfBirth ?? "",
      phoneNumber: initialValues.phoneNumber ?? "",
      address: initialValues.address ?? "",
      email: initialValues.email ?? "",
      taxCode: initialValues.taxCode ?? "",
      departmentId: initialValues.departmentId ?? null,
      baseSalary: initialValues.baseSalary ?? 0,
      LeaveDays: initialValues.LeaveDays ?? 0,
    },
  });

  useEffect(() => {
    getDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  async function submitEmployee(form: EmployeeRequest) {
    try {
      setError("");
      await onSubmit({
        ...form,
        name: form.name.trim(),
        address: form.address.trim(),
        phoneNumber: form.phoneNumber.replace(/[\s.-]/g, ""),
        email: form.email.trim(),
        taxCode: form.taxCode.replace(/\s/g, ""),
      });
    } catch {
      setError("Không thể lưu hồ sơ. Vui lòng kiểm tra dữ liệu và thử lại.");
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit(submitEmployee)}>
      <div className="formHeading">
        <p className="eyebrow">Thông tin hồ sơ</p>
        <p className="muted">Các trường có dấu * là bắt buộc.</p>
      </div>

      <div className="field fullField">
      <label htmlFor="name">Họ và tên *</label>
      <input
        id="name"
        aria-invalid={Boolean(errors.name)}
        {...register("name", {
          required: "Họ tên là bắt buộc",
          setValueAs: (value: string) => value.trim(),
          minLength: {
            value: 2,
            message: "Họ tên phải có từ 2 đến 100 ký tự",
          },
          maxLength: {
            value: 100,
            message: "Họ tên phải có từ 2 đến 100 ký tự",
          },
        })}
        placeholder="Nguyễn Văn A"
      />
      {errors.name && <p className="fieldError">{errors.name.message}</p>}
      </div>

      <div className="field">
      <label htmlFor="dateOfBirth">Ngày sinh *</label>
      <input
        id="dateOfBirth"
        type="date"
        max={new Date().toISOString().slice(0, 10)}
        aria-invalid={Boolean(errors.dateOfBirth)}
        {...register("dateOfBirth", {
          required: "Ngày sinh là bắt buộc",
          validate: (value) =>
            value <= today || "Ngày sinh không được ở tương lai",
        })}
      />
      {errors.dateOfBirth && (
        <p className="fieldError">{errors.dateOfBirth.message}</p>
      )}
      </div>

      <div className="field">
      <label htmlFor="phoneNumber">Số điện thoại *</label>
      <input
        id="phoneNumber"
        inputMode="tel"
        aria-invalid={Boolean(errors.phoneNumber)}
        {...register("phoneNumber", {
          required: "Số điện thoại là bắt buộc",
          validate: (value) =>
            /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(value.replace(/[\s.-]/g, "")) ||
            "Số điện thoại Việt Nam không hợp lệ",
        })}
      />
      {errors.phoneNumber && (
        <p className="fieldError">{errors.phoneNumber.message}</p>
      )}
      </div>

      <div className="field fullField">
      <label htmlFor="address">Địa chỉ *</label>
      <input
        id="address"
        aria-invalid={Boolean(errors.address)}
        {...register("address", {
          required: "Địa chỉ là bắt buộc",
          setValueAs: (value: string) => value.trim(),
          maxLength: {
            value: 255,
            message: "Địa chỉ không được vượt quá 255 ký tự",
          },
        })}
      />
      {errors.address && <p className="fieldError">{errors.address.message}</p>}
      </div>

      <div className="field">
      <label htmlFor="email">Email *</label>
      <input
        id="email"
        type="email"
        aria-invalid={Boolean(errors.email)}
        {...register("email", {
          required: "Email là bắt buộc",
          setValueAs: (value: string) => value.trim(),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Địa chỉ email không hợp lệ",
          },
        })}
      />
      {errors.email && <p className="fieldError">{errors.email.message}</p>}
      </div>

      <div className="field">
      <label htmlFor="taxCode">Mã số thuế *</label>
      <input
        id="taxCode"
        inputMode="numeric"
        maxLength={13}
        aria-invalid={Boolean(errors.taxCode)}
        {...register("taxCode", {
          required: "Mã số thuế là bắt buộc",
          validate: (value) =>
            /^\d{10}$/.test(value.replace(/\s/g, "")) ||
            "Mã số thuế phải gồm đúng 10 chữ số",
        })}
      />
      {errors.taxCode && <p className="fieldError">{errors.taxCode.message}</p>}
      </div>

      <div className="field">
      <label htmlFor="departmentId">Phòng ban *</label>
      <select
        id="departmentId"
        aria-invalid={Boolean(errors.departmentId)}
        {...register("departmentId", {
          setValueAs: (value: string) => (value ? Number(value) : null),
          validate: (value) => value !== null || "Phòng ban là bắt buộc",
        })}
      >
        <option value="" disabled>
          Chọn phòng ban
        </option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
      {errors.departmentId && (
        <p className="fieldError">{errors.departmentId.message}</p>
      )}
      </div>

      <div className="field">
        <label htmlFor="baseSalary">Lương cơ bản *</label>
        <input
          id="baseSalary"
          type="number"
          min="0"
          step="100000"
          {...register("baseSalary", {
            valueAsNumber: true,
            required: "Lương cơ bản là bắt buộc",
            min: { value: 0, message: "Lương không được là số âm" },
          })}
        />
        {errors.baseSalary && <p className="fieldError">{errors.baseSalary.message}</p>}
      </div>

      <div className="field">
        <label htmlFor="LeaveDays">Số ngày phép *</label>
        <input
          id="LeaveDays"
          type="number"
          min="0"
          step="1"
          {...register("LeaveDays", {
            valueAsNumber: true,
            required: "Số ngày phép là bắt buộc",
            min: { value: 0, message: "Số ngày phép không được âm" },
          })}
        />
        {errors.LeaveDays && <p className="fieldError">{errors.LeaveDays.message}</p>}
      </div>

      {error && <p className="error fullField">{error}</p>}

      <div className="formActions fullField">
        <button className="button primary" type="submit" title={submitLabel} disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
