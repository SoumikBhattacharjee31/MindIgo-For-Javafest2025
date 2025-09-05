package com.mindigo.discussion_service.dto.response;

import com.mindigo.discussion_service.entity.ReportReason;
import com.mindigo.discussion_service.entity.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private Long postId;
    private Long commentId;
    private String reporterEmail;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private String reviewedByEmail;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}