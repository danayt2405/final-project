package com.insa.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insa.dto.ComplaintDto;
import com.insa.dto.ComplaintTypeDto;
import com.insa.dto.ErrorResponse;
import com.insa.dto.ComplaintDto;
import com.insa.dto.ComplaintTrackingMinimalDto;
import com.insa.mapper.ComplaintMapper;
import java.util.stream.Collectors;

import com.insa.dto.ApiResponse;
import com.insa.entity.ComplaintType;
import com.insa.entity.User;
import com.insa.repository.ComplaintTypeRepository;
import com.insa.repository.UserRepository;
import com.insa.repository.UserTypeAccessRepository;
import com.insa.service.ComplaintService;
import com.insa.service.FileStorageService;

import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private static final Logger log = LoggerFactory.getLogger(ComplaintController.class);

    private final ComplaintService svc;
    private final UserRepository userRepository;
    private final UserTypeAccessRepository utaRepo;
    private final FileStorageService storage;
    private final ComplaintTypeRepository complaintTypeRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ComplaintController(
            ComplaintService svc,
            UserRepository userRepository,
            UserTypeAccessRepository utaRepo,
            FileStorageService storage,
            ComplaintTypeRepository complaintTypeRepo) {
        this.svc = svc;
        this.userRepository = userRepository;
        this.utaRepo = utaRepo;
        this.storage = storage;
        this.complaintTypeRepo = complaintTypeRepo;
    }

    // Submit (JSON)
    @PostMapping(value = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> submit(@RequestBody ComplaintDto complaintDto) {
        if (complaintDto == null) {
            return badRequest("Empty complaint payload");
        }
        try {
            var saved = svc.createComplaint(complaintDto, null, null);
            // Map to DTO using service's track method to ensure DB-generated fields are
            // loaded
            var dtoOpt = svc.trackComplaintDto(saved.getTrackingNumber());
            if (dtoOpt.isPresent())
                return ResponseEntity.ok(dtoOpt.get());
            // fallback minimal response
            Map<String, Object> m = Map.of("trackingNumber", saved.getTrackingNumber());
            return ResponseEntity.ok(m);
        } catch (IOException e) {
            log.error("IOException creating complaint: {}", e.getMessage());
            return serverError("Error processing complaint: " + e.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error creating complaint: {}", ex.getMessage());
            return serverError("Unexpected server error");
        }
    }

    // Submit WITH FILES (multipart)
    @PostMapping(value = "/submit-with-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitWithFiles(
            @RequestPart("payload") String payload,
            @RequestPart(value = "attachments", required = false) MultipartFile[] attachments,
            @RequestPart(value = "voiceFiles", required = false) MultipartFile[] voiceFiles) {

        if (!StringUtils.hasText(payload)) {
            return badRequest("Missing payload");
        }

        try {
            ComplaintDto dto = objectMapper.readValue(payload, ComplaintDto.class);
            List<MultipartFile> attachList = multipartToList(attachments);
            List<MultipartFile> voiceList = multipartToList(voiceFiles);

            var saved = svc.createComplaint(dto, attachList, voiceList);
            var dtoOpt = svc.trackComplaintDto(saved.getTrackingNumber());
            if (dtoOpt.isPresent())
                return ResponseEntity.ok(dtoOpt.get());
            return ResponseEntity.ok(Map.of("trackingNumber", saved.getTrackingNumber()));

        } catch (JsonProcessingException ex) {
            return badRequest("Invalid JSON: " + ex.getOriginalMessage());
        } catch (IOException ex) {
            return serverError("Error saving files: " + ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected create complaint error: {}", ex.getMessage());
            return serverError("Unexpected server error");
        }
    }

    // Track complaint -> returns minimal DTO wrapped in ApiResponse
    @GetMapping("/{trackingNumber}")
    public ResponseEntity<ApiResponse<ComplaintTrackingMinimalDto>> track(
            @PathVariable String trackingNumber) {

        if (!StringUtils.hasText(trackingNumber)) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("trackingNumber is required"));
        }

        return svc.trackMinimal(trackingNumber.trim())
                .map(dto -> ResponseEntity.ok(new ApiResponse<>(dto)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Complaint not found")));
    }

    // -------------------------
    // SUBMITTED (ADMIN) - returns List<ComplaintDto>
    // -------------------------
    @GetMapping("/submitted")
    public ResponseEntity<?> getSubmittedComplaints(Authentication auth) {
        if (auth == null)
            return unauthorized("Unauthorized");

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If super_admin, return all; otherwise fetch allowed types for the user
        List<Long> allowedTypeIds = new ArrayList<>();
        if (user.getRole() != User.Role.super_admin) {
            // get allowed type ids for this user (if any)
            utaRepo.findByUser(user).forEach(uta -> {
                if (uta.getType() != null && uta.getType().getId() != null)
                    allowedTypeIds.add(uta.getType().getId());
            });
        }

        try {
            List<ComplaintDto> dtos = svc.getComplaintsForAdmin(user, allowedTypeIds);
            return ResponseEntity.ok(dtos);
        } catch (Exception ex) {
            log.error("Error fetching submitted complaints: {}", ex.getMessage());
            return serverError("Error loading submitted complaints");
        }
    }

    // Upload evidence
    @PostMapping(value = "/{trackingNumber}/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadEvidence(
            @PathVariable String trackingNumber,
            @RequestPart(value = "files") MultipartFile[] files) {

        if (!StringUtils.hasText(trackingNumber)) {
            return badRequest("trackingNumber is required");
        }

        List<MultipartFile> safe = multipartToList(files);
        if (safe.isEmpty()) {
            return badRequest("No files provided");
        }

        try {
            svc.uploadEvidence(trackingNumber.trim(), safe);
            return ResponseEntity.ok(Map.of("message", "Files uploaded successfully"));
        } catch (IOException ex) {
            return serverError("Error uploading files: " + ex.getMessage());
        }
    }

    // Add additional info
    @PostMapping(value = "/{trackingNumber}/info", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addInfo(
            @PathVariable String trackingNumber,
            @RequestBody Map<String, String> req) {

        if (!StringUtils.hasText(trackingNumber)) {
            return badRequest("trackingNumber is required");
        }

        String info = req != null ? req.get("info") : null;
        if (!StringUtils.hasText(info)) {
            return badRequest("info is required");
        }

        try {
            svc.addAdditionalInfo(trackingNumber.trim(), info.trim());
            return ResponseEntity.ok(Map.of("message", "Info added successfully"));
        } catch (Exception ex) {
            return serverError("Error adding info");
        }
    }

    // Admin responds
    @PutMapping(value = "/{trackingNumber}/response", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> adminRespond(
            @PathVariable String trackingNumber,
            @RequestBody Map<String, Object> req,
            Authentication auth) {

        if (!StringUtils.hasText(trackingNumber)) {
            return badRequest("trackingNumber is required");
        }

        if (auth == null) {
            return unauthorized("Unauthorized");
        }

        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!(user.getRole() == User.Role.admin || user.getRole() == User.Role.super_admin)) {
            throw new AccessDeniedException("No admin privileges");
        }

        Long statusId = req.get("statusId") != null
                ? Long.valueOf(req.get("statusId").toString())
                : null;

        String response = req.get("response") != null
                ? req.get("response").toString()
                : null;

        try {
            svc.adminRespond(trackingNumber.trim(), statusId, response);
            return ResponseEntity.ok(Map.of("message", "Response updated"));
        } catch (Exception ex) {
            return serverError("Error updating response");
        }
    }

    // Get complaint types (returns DTO)
    @GetMapping("/complaint-types")
    public ResponseEntity<?> getTypes() {
        List<ComplaintType> types = complaintTypeRepo.findAll();
        List<ComplaintTypeDto> dtos = types.stream().map(t -> {
            ComplaintTypeDto d = new ComplaintTypeDto();
            d.setId(t.getId());
            d.setName(t.getName());
            return d;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Helpers
    private List<MultipartFile> multipartToList(MultipartFile[] arr) {
        if (arr == null)
            return Collections.emptyList();
        return Arrays.stream(arr).filter(Objects::nonNull).collect(Collectors.toList());
    }

    private ResponseEntity<?> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(message, HttpStatus.BAD_REQUEST));
    }

    private ResponseEntity<?> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody(message, HttpStatus.UNAUTHORIZED));
    }

    private ResponseEntity<?> serverError(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody(message, HttpStatus.INTERNAL_SERVER_ERROR));
    }

    private Map<String, Object> errorBody(String msg, HttpStatus status) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("timestamp", Instant.now().toString());
        map.put("status", status.value());
        map.put("error", status.getReasonPhrase());
        map.put("message", msg);
        return map;
    }

    @Data
    public static class SimpleMessage {
        private final String message;
    }
}
