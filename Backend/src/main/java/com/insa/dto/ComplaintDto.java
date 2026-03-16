package com.insa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ComplaintDto {

    private Long id;
    private String trackingNumber;

    // NEW FIELD (required for frontend -> backend communication)
    private Long typeId;

    // For input when user sends typeName
    private String typeName;

    private String fullName;
    private String jobTitle;
    private String workDepartment;
    private String location;
    private String responsibleEntity;
    private String damageLoss;
    private String additionalDetails;
    private String description;
    private String executionStatus;
    private String dateOccurred;

    private ComplaintTypeDto type;      
    private StatusDto status;           
    private ComplainantDto complainant;
    private List<AttachmentDto> attachments;

    private String errorMessage;

    public ComplaintDto(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Long getTypeId() {
        if (typeId != null) return typeId;
        if (this.type != null) return this.type.getId();
        return null;
    }
}
