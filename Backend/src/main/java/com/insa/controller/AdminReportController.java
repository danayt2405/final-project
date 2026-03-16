package com.insa.controller;

import com.insa.entity.User;
import com.insa.repository.UserRepository;
import com.insa.repository.UserTypeAccessRepository;
import com.insa.service.ReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/admin")
public class AdminReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;
    private final UserTypeAccessRepository utaRepo;

    public AdminReportController(
            ReportService reportService,
            UserRepository userRepository,
            UserTypeAccessRepository utaRepo) {
        this.reportService = reportService;
        this.userRepository = userRepository;
        this.utaRepo = utaRepo;
    }

    /*
     * -------------------------------------------------------
     * SUMMARY BY STATUS WITH DATE + STATUS FILTERS
     * -------------------------------------------------------
     */
    @GetMapping("/report/summary-by-status")
    public ResponseEntity<?> summaryByStatus(
            Authentication auth,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,

            @RequestParam(required = false) String status) {

        User user = getAuthenticatedUser(auth);
        List<Long> allowed = resolveAllowedTypeIds(user);

        return ResponseEntity.ok(
                reportService.summaryByStatus(
                        user,
                        allowed,
                        startDate,
                        endDate,
                        status));
    }

    /*
     * -------------------------------------------------------
     * DEPARTMENT SUMMARY WITH DATE + STATUS FILTERS
     * -------------------------------------------------------
     */
    @GetMapping("/report/department-summary")
    public ResponseEntity<?> departmentSummary(
            Authentication auth,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,

            @RequestParam(required = false) String status) {

        User user = getAuthenticatedUser(auth);
        List<Long> allowed = resolveAllowedTypeIds(user);

        return ResponseEntity.ok(
                reportService.departmentSummary(
                        user,
                        allowed,
                        startDate,
                        endDate));
    }

    /*
     * -------------------------------------------------------
     * Helper Methods
     * -------------------------------------------------------
     */
    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authenticated user");
        }

        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private List<Long> resolveAllowedTypeIds(User user) {
        if (user.getRole() == User.Role.super_admin) {
            return null; // full access
        }

        return utaRepo.findByUserId(user.getId())
                .stream()
                .map(u -> u.getType().getId())
                .collect(Collectors.toList());
    }
}
