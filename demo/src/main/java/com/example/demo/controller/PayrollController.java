package com.example.demo.controller;

import com.example.demo.dto.response.PayrollResponse;
import com.example.demo.service.PayrollService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(
            PayrollService payrollService) {
                this.payrollService = payrollService;
    }

    @GetMapping("/{employeeId}")
    // Ví dụ: GET /api/payroll/1?toDate=2026-09-30
    // Endpoint hiện tại vừa tính vừa lưu payroll; xem ghi chú ở PayrollService trước khi dùng số tiền.
    public PayrollResponse getCurrentPayroll(
            @PathVariable Long employeeId,
            @RequestParam LocalDate toDate) {

        return payrollService
            .calculateCurrentPayroll(
                employeeId,
                toDate
                );
    }
}
