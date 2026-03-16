package com.insa.dto;

import lombok.Data;

@Data
public class ComplaintResponseDto {

    private String trackingNumber;

    // Status
    private Long statusId;
    private String statusMessage;

    // Complaint Type
    private Long typeId;
    private String typeName;

    // You can add more fields if needed (timestamps, message, etc.)
}
