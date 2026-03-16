package com.insa.mapper;

import com.insa.dto.*;
import com.insa.entity.Attachment;
import com.insa.entity.Complaint;
import com.insa.entity.ComplaintType;
import com.insa.entity.Status;

import java.util.List;
import java.util.stream.Collectors;

public class ComplaintMapper {

    // -----------------------------------------------------------
    // BASIC RESPONSE DTO
    // -----------------------------------------------------------
    public static ComplaintResponseDto toDto(Complaint c) {
        if (c == null)
            return null;

        ComplaintResponseDto dto = new ComplaintResponseDto();
        dto.setTrackingNumber(c.getTrackingNumber());
        dto.setStatusId(c.getStatus() != null ? c.getStatus().getId() : null);
        dto.setStatusMessage(c.getStatus() != null ? c.getStatus().getName() : null);

        if (c.getType() != null) {
            dto.setTypeId(c.getType().getId());
            dto.setTypeName(c.getType().getName());
        }
        return dto;
    }

    // ------------------------------------------------------------
    // FULL COMPLAINT DTO (Used in tracking + admin panel)
    // ------------------------------------------------------------
    public static ComplaintDto toFullDto(Complaint c) {
        if (c == null)
            return null;

        ComplaintDto dto = new ComplaintDto();

        dto.setId(c.getId());
        dto.setTrackingNumber(c.getTrackingNumber());
        dto.setFullName(c.getFullName());
        dto.setJobTitle(c.getPosition());
        dto.setWorkDepartment(c.getWorkDepartment());
        dto.setLocation(c.getLocation());
        dto.setResponsibleEntity(c.getResponsibleEntity());
        dto.setDamageLoss(c.getDamageLoss());
        dto.setAdditionalDetails(c.getAdditionalDetails());
        dto.setDescription(c.getDescription());
        dto.setExecutionStatus(c.getExecutionStatus() != null ? c.getExecutionStatus().name() : null);
        dto.setDateOccurred(c.getDateOccurred() != null ? c.getDateOccurred().toString() : null);

        // Type
        if (c.getType() != null) {
            ComplaintTypeDto t = new ComplaintTypeDto();
            t.setId(c.getType().getId());
            t.setName(c.getType().getName());
            dto.setType(t);
            dto.setTypeName(c.getType().getName());
        }

        // Status
        if (c.getStatus() != null) {
            StatusDto sd = new StatusDto();
            sd.setId(c.getStatus().getId());
            sd.setName(c.getStatus().getName());
            dto.setStatus(sd);
        }

        // Complainant
        if (c.getComplainant() != null) {
            ComplainantDto cd = new ComplainantDto();
            cd.setFullName(c.getComplainant().getFullName());
            cd.setPhone(c.getComplainant().getPhone());

            cd.setPosition(c.getComplainant().getPosition());
            cd.setDepartment(c.getComplainant().getDepartment());
            cd.setAnonymous(c.getComplainant().isAnonymous());
            dto.setComplainant(cd);
        }

        // Attachments
        if (c.getAttachments() != null) {
            dto.setAttachments(
                    c.getAttachments().stream()
                            .map(ComplaintMapper::attachmentToDto)
                            .collect(Collectors.toList()));
        }

        return dto;
    }

    // ------------------------------------------------------------
    // Attachments
    // ------------------------------------------------------------
    public static AttachmentDto attachmentToDto(Attachment a) {
        if (a == null)
            return null;
        AttachmentDto d = new AttachmentDto();
        d.setId(a.getId());
        d.setFileName(a.getFileName());
        d.setFilePath(a.getFilePath());
        d.setFileType(a.getFileType());
        d.setFileSizeBytes(a.getFileSizeBytes());
        return d;
    }

    // ------------------------------------------------------------
    // Minimal DTO used for tracking
    // ------------------------------------------------------------
    public static ComplaintTrackingMinimalDto toMinimalDto(Complaint c) {
        ComplaintTrackingMinimalDto dto = new ComplaintTrackingMinimalDto();

        dto.setTrackingNumber(c.getTrackingNumber());
        dto.setStatusName(c.getStatus() != null ? c.getStatus().getName() : "N/A");
        dto.setResponseText(c.getResponseText());
        dto.setResponseDate(c.getResponseDate() != null ? c.getResponseDate().toString() : null);

        return dto;
    }
}
