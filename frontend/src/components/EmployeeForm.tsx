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
      setError("Request failed. Check backend/API permissions.");
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit(submitEmployee)}>
      <label htmlFor="name">Employee name</label>
      <input
        id="name"
        aria-invalid={Boolean(errors.name)}
        {...register("name", {
          required: "Employee name is required",
          setValueAs: (value: string) => value.trim(),
          minLength: {
            value: 2,
            message: "Name must be between 2 and 100 characters",
          },
          maxLength: {
            value: 100,
            message: "Name must be between 2 and 100 characters",
          },
        })}
        placeholder="Nguyen Van A"
      />
      {errors.name && <p className="fieldError">{errors.name.message}</p>}

      <label htmlFor="dateOfBirth">Date of birth</label>
      <input
        id="dateOfBirth"
        type="date"
        max={new Date().toISOString().slice(0, 10)}
        aria-invalid={Boolean(errors.dateOfBirth)}
        {...register("dateOfBirth", {
          required: "Date of birth is required",
          validate: (value) =>
            value <= today || "Date of birth cannot be in the future",
        })}
      />
      {errors.dateOfBirth && (
        <p className="fieldError">{errors.dateOfBirth.message}</p>
      )}

      <label htmlFor="phoneNumber">Phone number</label>
      <input
        id="phoneNumber"
        inputMode="tel"
        aria-invalid={Boolean(errors.phoneNumber)}
        {...register("phoneNumber", {
          required: "Phone number is required",
          validate: (value) =>
            /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(value.replace(/[\s.-]/g, "")) ||
            "Enter a valid Vietnamese phone number",
        })}
      />
      {errors.phoneNumber && (
        <p className="fieldError">{errors.phoneNumber.message}</p>
      )}

      <label htmlFor="address">Address</label>
      <input
        id="address"
        aria-invalid={Boolean(errors.address)}
        {...register("address", {
          required: "Address is required",
          setValueAs: (value: string) => value.trim(),
          maxLength: {
            value: 255,
            message: "Address must not exceed 255 characters",
          },
        })}
      />
      {errors.address && <p className="fieldError">{errors.address.message}</p>}

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        aria-invalid={Boolean(errors.email)}
        {...register("email", {
          required: "Email is required",
          setValueAs: (value: string) => value.trim(),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
          },
        })}
      />
      {errors.email && <p className="fieldError">{errors.email.message}</p>}

      <label htmlFor="taxCode">Tax code</label>
      <input
        id="taxCode"
        inputMode="numeric"
        maxLength={13}
        aria-invalid={Boolean(errors.taxCode)}
        {...register("taxCode", {
          required: "Tax code is required",
          validate: (value) =>
            /^\d{10}$/.test(value.replace(/\s/g, "")) ||
            "Tax code must contain exactly 10 digits",
        })}
      />
      {errors.taxCode && <p className="fieldError">{errors.taxCode.message}</p>}

      <label htmlFor="departmentId">Department</label>
      <select
        id="departmentId"
        aria-invalid={Boolean(errors.departmentId)}
        {...register("departmentId", {
          setValueAs: (value: string) => (value ? Number(value) : null),
          validate: (value) => value !== null || "Department is required",
        })}
      >
        <option value="" disabled>
          Select a department
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

      {error && <p className="error">{error}</p>}

      <button className="button primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
