package com.insa.controller;

import com.insa.dto.ApiResponse;
import com.insa.dto.StatusDto;
import com.insa.entity.Status;
import com.insa.repository.StatusRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/statuses")
public class StatusController {

    private final StatusRepository statusRepo;

    public StatusController(StatusRepository statusRepo) {
        this.statusRepo = statusRepo;
    }

    // Get all statuses as DTO
    @GetMapping
    public ResponseEntity<ApiResponse<List<StatusDto>>> getAllStatuses() {

        List<StatusDto> dtos = statusRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(dtos));
    }

    // Optional: Get a single status by ID (for admin usage)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StatusDto>> getStatusById(@PathVariable Long id) {

        return statusRepo.findById(id)
                .map(status -> ResponseEntity.ok(new ApiResponse<>(toDto(status))))
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>("Status not found")));
    }

    // Convert Entity → DTO
    private StatusDto toDto(Status status) {
        StatusDto dto = new StatusDto();
        dto.setId(status.getId());
        dto.setName(status.getName());
        return dto;
    }
}
