package com.example.demo.controller;

import com.example.demo.entity.Attendance;
import com.example.demo.service.AttendanceService;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        @RestController
        @RequestMapping("/api/attendance")
        public class AttendanceController {

        private final AttendanceService attendanceService;

        // Gọi bằng JWT sau khi đăng nhập. employeeId là ID của nhân viên trong bảng employees.
        // Không truyền giờ từ client: server dùng thời gian hiện tại của máy đang chạy backend.

        public AttendanceController(
                AttendanceService attendanceService
        ) {
                this.attendanceService =
                        attendanceService;
        }

        @PostMapping("/check-in/{employeeId}")
        public ResponseEntity<Attendance> checkIn(
                @PathVariable Long employeeId
        ) {

                Attendance result =
                        attendanceService.checkIn(
                                employeeId,
                                LocalDateTime.now()
                        );

                return ResponseEntity.ok(result);
        }

        @PostMapping("/check-out/{employeeId}")
        public ResponseEntity<Attendance> checkOut(
                @PathVariable Long employeeId
        ) {

                Attendance result =
                        attendanceService.checkOut(
                                employeeId,
                                LocalDateTime.now()
                        );
                return ResponseEntity.ok(result);
        }
        @GetMapping("/{employeeId}/daily")
        // Ví dụ: GET /api/attendance/1/daily?date=2026-09-14
        // checkOut có thể null khi quên chấm ra; effectiveOut là giờ hệ thống dùng để tính.
        public Attendance daily(@PathVariable Long employeeId, @RequestParam LocalDate date) {
                return attendanceService.daily(employeeId, date);
        }

        @GetMapping("/{employeeId}/monthly-balance")
        // Ví dụ: GET /api/attendance/1/monthly-balance?month=2026-09&toDate=2026-09-30
        // Kết quả tính bằng phút: dương là thiếu, âm là dư; OT không bù vào số này.
        public int monthlyBalance(@PathVariable Long employeeId, @RequestParam YearMonth month,
                @RequestParam LocalDate toDate) {
                if (!YearMonth.from(toDate).equals(month)) throw new IllegalArgumentException("toDate must be in month");
                return attendanceService.monthlyBalance(employeeId, month, toDate);
        }
        }
