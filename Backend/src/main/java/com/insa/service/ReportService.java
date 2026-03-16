package com.insa.service;

import com.insa.entity.Complaint;
import com.insa.entity.User;
import com.insa.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ComplaintRepository complaintRepository;

    public ReportService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    /*
     * ============================================================
     * 1. FILTER BY DATE (YEAR, MONTH, RANGE)
     * ============================================================
     */
    public List<Complaint> applyDateFilters(
            List<Complaint> complaints,
            LocalDate startDate,
            LocalDate endDate) {

        return complaints.stream()
                .filter(c -> c.getCreatedAt() != null)
                .filter(c -> {
                    LocalDate created = c.getCreatedAt().toLocalDate();

                    if (startDate != null && created.isBefore(startDate))
                        return false;
                    if (endDate != null && created.isAfter(endDate))
                        return false;

                    return true;
                })
                .toList();
    }

    /*
     * ============================================================
     * 2. SUMMARY BY STATUS
     * ============================================================
     */
    public Map<String, Long> summaryByStatus(
            User user,
            List<Long> allowedTypeIds,
            LocalDate startDate,
            LocalDate endDate,
            String statusFilter) {

        List<Complaint> complaints = getAllowedComplaints(user, allowedTypeIds);

        // apply date filter
        complaints = applyDateFilters(complaints, startDate, endDate);

        // apply status filter if provided
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("all")) {
            String normalized = statusFilter.toLowerCase().replace(" ", "_");
            complaints = complaints.stream()
                    .filter(c -> c.getStatus() != null)
                    .filter(c -> normalized.equalsIgnoreCase(c.getStatus().getName()))
                    .toList();
        }

        // group + count
        return complaints.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getStatus() == null || c.getStatus().getName() == null
                                ? "unknown"
                                : c.getStatus().getName().toLowerCase().replace(" ", "_"),
                        Collectors.counting()));
    }

    /*
     * ============================================================
     * 3. SUMMARY BY DEPARTMENT
     * ============================================================
     */
    public List<Map<String, Object>> departmentSummary(
            User user,
            List<Long> allowedTypeIds,
            LocalDate startDate,
            LocalDate endDate) {

        List<Complaint> complaints = getAllowedComplaints(user, allowedTypeIds);

        complaints = applyDateFilters(complaints, startDate, endDate);

        // group complaints by department
        Map<String, List<Complaint>> grouped = complaints.stream()
                .filter(c -> c.getType() != null && c.getType().getName() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getType().getName().toLowerCase()));

        List<Map<String, Object>> result = new ArrayList<>();

        for (String dept : grouped.keySet()) {
            List<Complaint> deptComplaints = grouped.get(dept);

            long submitted = countByStatus(deptComplaints, "submitted");
            long inReview = countByStatus(deptComplaints, "in_review");
            long investigating = countByStatus(deptComplaints, "investigating");
            long resolved = countByStatus(deptComplaints, "resolved");
            long rejected = countByStatus(deptComplaints, "rejected");
            long closed = countByStatus(deptComplaints, "closed");

            long total = submitted + inReview + investigating + resolved + rejected + closed;

            Map<String, Object> data = new HashMap<>();
            data.put("department", dept);
            data.put("submitted", submitted);
            data.put("in_review", inReview);
            data.put("investigating", investigating);
            data.put("resolved", resolved);
            data.put("rejected", rejected);
            data.put("closed", closed);
            data.put("total", total);

            result.add(data);
        }

        return result;
    }

    /*
     * ============================================================
     * 4. COUNT HELPER
     * ============================================================
     */
    private long countByStatus(List<Complaint> complaints, String targetStatus) {
        return complaints.stream()
                .filter(c -> c.getStatus() != null && c.getStatus().getName() != null)
                .filter(c -> targetStatus.equalsIgnoreCase(c.getStatus().getName()))
                .count();
    }

    /*
     * ============================================================
     * 5. FILTER ALLOWED COMPLAINTS
     * ============================================================
     */
    private List<Complaint> getAllowedComplaints(User user, List<Long> allowedTypeIds) {

        // super admin -> can access everything
        if (user.getRole() == User.Role.super_admin) {
            return complaintRepository.findAll();
        }

        // no access -> return empty
        if (allowedTypeIds == null || allowedTypeIds.isEmpty()) {
            return Collections.emptyList();
        }

        return complaintRepository.findByTypeIdIn(allowedTypeIds);
    }
}
