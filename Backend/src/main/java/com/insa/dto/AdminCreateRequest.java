package com.insa.dto;

import lombok.Data;

@Data
public class AdminCreateRequest {

    private String username;
    private String fullName;
    private String password;
    private String phone;
    private String email;

    private Long complaintTypeId; // ✅ department
}