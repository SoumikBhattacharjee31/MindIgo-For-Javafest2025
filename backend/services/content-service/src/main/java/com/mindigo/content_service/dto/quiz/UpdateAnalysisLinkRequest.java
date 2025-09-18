package com.mindigo.content_service.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAnalysisLinkRequest {
    private String targetUserId;
    private String quizCode;
    private String analysisReportLink;
}