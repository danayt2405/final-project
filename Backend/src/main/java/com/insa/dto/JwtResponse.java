package com.insa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String username;
    private String role;
    private Long userId;
    private List<Long> allowedTypeIds;
}
