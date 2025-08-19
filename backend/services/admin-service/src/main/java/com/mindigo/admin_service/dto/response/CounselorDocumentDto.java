package com.mindigo.admin_service.dto.response;

import com.mindigo.admin_service.entity.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorDocumentDto {
    private Long id;
    private DocumentType documentType;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private LocalDateTime uploadedAt;
    private Boolean verified;
    private String verifiedBy;
    private String verificationComments;
}
