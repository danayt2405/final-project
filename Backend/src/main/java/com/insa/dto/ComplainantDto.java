package com.insa.dto;

import lombok.Data;

@Data
public class ComplainantDto {
    private String fullName;
    private String phone;

    private String position;
    private String department;
    private Boolean anonymous;
}
