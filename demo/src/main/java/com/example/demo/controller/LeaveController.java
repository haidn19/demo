package com.example.demo.controller;

import com.example.demo.dto.request.LeaveRequest;
import com.example.demo.entity.Leave;
import com.example.demo.service.LeaveService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/leaves")
public class LeaveController {
    private final LeaveService leaveService;
    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    public List<Leave> getAllLeaveRequests() {
        return leaveService.getAllLeaves();
    }

    // 1. EMPLOYEE TẠO ĐƠN NGHỈ PHÉP
    @PostMapping
    public ResponseEntity<Leave> createLeaveRequest(
            @RequestBody LeaveRequest request) {

        Leave leave = leaveService.createLeave(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(leave);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Leave> approveLeaveRequest(
            @PathVariable Long id) {
        Leave leave = leaveService.approveLeave(id);
        return ResponseEntity.ok(leave);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Leave> rejectLeaveRequest(
            @PathVariable Long id) {
        Leave leave = leaveService.rejectLeave(id);
        return ResponseEntity.ok(leave);
    }
}
