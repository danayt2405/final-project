package com.insa.service;

import com.insa.dto.ComplaintDto;
import com.insa.dto.ComplainantDto;
import com.insa.dto.ComplaintTrackingMinimalDto;
import com.insa.mapper.ComplaintMapper;
import com.insa.entity.Attachment;
import com.insa.entity.Complainant;
import com.insa.entity.Complaint;
import com.insa.entity.ComplaintType;
import com.insa.entity.User;
import com.insa.entity.Status;
import com.insa.repository.*;

import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

import java.util.*;

@Service
public class ComplaintService {

    private static final Logger log = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepo;
    private final ComplainantRepository complainantRepo;
    private final ComplaintTypeRepository typeRepo;
    private final StatusRepository statusRepo;
    private final AttachmentRepository attachRepo;
    private final FileStorageService storage;

    @PersistenceContext
    private EntityManager em; // 🔥 Needed to refresh DB-triggered values

    public ComplaintService(
            ComplaintRepository complaintRepo,
            ComplainantRepository complainantRepo,
            ComplaintTypeRepository typeRepo,
            StatusRepository statusRepo,
            AttachmentRepository attachRepo,
            FileStorageService storage) {
        this.complaintRepo = complaintRepo;
        this.complainantRepo = complainantRepo;
        this.typeRepo = typeRepo;
        this.statusRepo = statusRepo;
        this.attachRepo = attachRepo;
        this.storage = storage;
    }

    // =======================================================
    // CREATE / SUBMIT A COMPLAINT
    // =======================================================
    @Transactional
    public Complaint createComplaint(
            ComplaintDto dto,
            List<MultipartFile> attachments,
            List<MultipartFile> voiceFiles) throws IOException {

        if (dto == null)
            throw new IllegalArgumentException("Complaint payload is missing");

        // Save complainant
        Complainant complainant = buildAndSaveComplainant(dto.getComplainant());

        // Resolve complaint type
        ComplaintType type = resolveComplaintType(dto.getTypeId(), dto.getTypeName());

        // Build complaint object
        Complaint complaint = buildComplaint(dto, complainant, type);

        // 🔥 Default status = Submitted if not provided
        if (complaint.getStatus() == null) {
            Status submittedStatus = statusRepo.findByNameIgnoreCase("Submitted")
                    .orElseThrow(() -> new RuntimeException("Default status 'Submitted' not found"));
            complaint.setStatus(submittedStatus);
        }

        // 4. Save to DB (INSERT happens here)
        Complaint saved = complaintRepo.save(complaint);

        // 🔥 Refresh to load DB-trigger-generated fields (tracking_number, timestamps)
        em.flush();
        em.refresh(saved);

        // Save attachments after refresh
        saveAttachmentBatch(saved, attachments, "document");
        saveAttachmentBatch(saved, voiceFiles, "voice");

        return saved; // Now contains trackingNumber
    }

    // Build complaint safely
    private Complaint buildComplaint(ComplaintDto dto, Complainant complainant, ComplaintType type) {
        Complaint c = new Complaint();

        c.setComplainant(complainant);
        c.setType(type);
        c.setFullName(dto.getFullName());
        c.setPosition(dto.getJobTitle());
        c.setWorkDepartment(dto.getWorkDepartment());
        c.setLocation(dto.getLocation());
        c.setDescription(dto.getDescription());
        c.setAdditionalDetails(dto.getAdditionalDetails());
        c.setDamageLoss(dto.getDamageLoss());
        c.setResponsibleEntity(dto.getResponsibleEntity());

        // Parse date
        if (dto.getDateOccurred() != null) {
            try {
                c.setDateOccurred(LocalDate.parse(dto.getDateOccurred().trim()));
            } catch (DateTimeParseException e) {
                log.warn("Invalid date: {}", dto.getDateOccurred());
            }
        }

        // Tracking number + timestamps
        c.setTrackingNumber(null);

        c.setCreatedAt(LocalDateTime.now());

        // Status only if frontend sends it (rare)
        if (dto.getStatus() != null && dto.getStatus().getId() != null) {
            statusRepo.findById(dto.getStatus().getId()).ifPresent(c::setStatus);
        }

        // Set execution status
        if (dto.getExecutionStatus() != null) {
            try {
                c.setExecutionStatus(Complaint.ExecutionStatus.valueOf(dto.getExecutionStatus()));
            } catch (Exception e) {
                log.warn("Invalid execution status: {}", dto.getExecutionStatus());
            }
        }

        return c;
    }

    private Complainant buildAndSaveComplainant(ComplainantDto dto) {
        if (dto == null || dto.getFullName() == null)
            return null;

        Complainant c = new Complainant();
        c.setFullName(dto.getFullName());
        c.setPhone(dto.getPhone());

        c.setPosition(dto.getPosition());
        c.setDepartment(dto.getDepartment());
        c.setAnonymous(Boolean.TRUE.equals(dto.getAnonymous()));

        return complainantRepo.save(c);
    }

    // Resolve complaint type
    private ComplaintType resolveComplaintType(Long id, String name) {
        if (id != null)
            return typeRepo.findById(id).orElse(null);

        if (name != null)
            return typeRepo.findByNameIgnoreCase(name.trim()).orElse(null);

        return null;
    }

    // =======================================================
    // SAVE ATTACHMENTS
    // =======================================================
    private void saveAttachmentBatch(Complaint complaint, List<MultipartFile> files, String defaultType)
            throws IOException {

        if (files == null || files.isEmpty())
            return;

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;

            String path = storage.store(file, complaint.getId());

            Attachment a = new Attachment();
            a.setComplaint(complaint);
            a.setFileName(file.getOriginalFilename());
            a.setFilePath(path);
            a.setFileSizeBytes(file.getSize());

            String mime = file.getContentType();
            if (mime != null) {
                if (mime.startsWith("audio"))
                    a.setFileType("voice");
                else if (mime.startsWith("video"))
                    a.setFileType("video");
                else if (mime.startsWith("image"))
                    a.setFileType("image");
                else
                    a.setFileType("document");
            } else {
                a.setFileType(defaultType);
            }

            attachRepo.save(a);
        }
    }

    // =======================================================
    // TRACK COMPLAINT
    // =======================================================
    public Optional<Complaint> trackComplaint(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank())
            return Optional.empty();

        return complaintRepo.findFullByTrackingNumber(trackingNumber.trim());
    }

    // =====================================================================
    // TRACK — DTO (full)
    // =====================================================================
    @Transactional(readOnly = true)
    public Optional<ComplaintDto> trackComplaintDto(String trackingNumber) {
        return trackComplaint(trackingNumber)
                .map(c -> {
                    if (c.getAttachments() != null)
                        c.getAttachments().size();
                    if (c.getComplainant() != null)
                        c.getComplainant().getFullName();
                    if (c.getType() != null)
                        c.getType().getName();
                    if (c.getStatus() != null)
                        c.getStatus().getName();
                    return ComplaintMapper.toFullDto(c);
                });
    }

    @Transactional(readOnly = true)
    public Optional<ComplaintTrackingMinimalDto> trackMinimal(String trackingNumber) {
        return trackComplaint(trackingNumber)
                .map(ComplaintMapper::toMinimalDto);
    }

    // =====================================================================
    // UPLOAD EVIDENCE
    // =======================================================
    @Transactional
    public void uploadEvidence(String trackingNumber, List<MultipartFile> files) throws IOException {
        Complaint c = trackComplaint(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        saveAttachmentBatch(c, files, "document");
    }

    // =======================================================
    // ADD ADDITIONAL INFO
    // =======================================================
    @Transactional
    public void addAdditionalInfo(String trackingNumber, String info) {
        Complaint c = trackComplaint(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        String existing = c.getAdditionalDetails();
        if (existing == null)
            existing = "";

        c.setAdditionalDetails(existing + "\n" + info);
        complaintRepo.save(c);
    }

    // =======================================================
    // ADMIN RESPONSE
    // =======================================================
    @Transactional
    public void adminRespond(String trackingNumber, Long statusId, String response) {
        Complaint c = trackComplaint(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (statusId != null)
            statusRepo.findById(statusId).ifPresent(c::setStatus);

        c.setResponseText(response);
        c.setResponseDate(LocalDateTime.now());

        complaintRepo.save(c);
    }

    // =====================================================================
    // ADMIN LIST
    // =====================================================================
    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsForAdmin(User user, List<Long> allowedTypeIds) {
        List<Complaint> list;

        if (user.getRole() == User.Role.super_admin) {
            list = complaintRepo.findAllFull();
        } else {
            list = complaintRepo.findByTypeIdIn(allowedTypeIds);
        }

        return list.stream()
                .map(c -> {
                    if (c.getAttachments() != null)
                        c.getAttachments().size();
                    if (c.getComplainant() != null)
                        c.getComplainant().getFullName();
                    if (c.getType() != null)
                        c.getType().getName();
                    if (c.getStatus() != null)
                        c.getStatus().getName();
                    return ComplaintMapper.toFullDto(c);
                })
                .collect(Collectors.toList());
    }
}
