package com.insa.dto;

import lombok.Data;

@Data
public class AttachmentDto {
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSizeBytes;
}
