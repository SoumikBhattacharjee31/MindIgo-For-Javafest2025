package com.mindigo.auth_service.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CounselorRatingResponse {
    private String userName;
    private String userProfileImageUrl;
    private Integer rating;
    private String review;
    private LocalDateTime createdAt;
}