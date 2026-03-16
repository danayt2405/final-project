package com.insa.dto;

import lombok.Data;

@Data
public class ComplaintTrackingMinimalDto {
    private String trackingNumber;

    // Status
    private String statusName;

    // Admin response
    private String responseText;
    private String responseDate;
}
