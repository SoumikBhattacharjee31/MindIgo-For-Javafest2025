package com.mindigo.discussion_service.dto.response;

import com.mindigo.discussion_service.entity.RestrictionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRestrictionResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private RestrictionType restrictionType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String restrictedByEmail;
    private Boolean isActive;
    private LocalDateTime createdAt;
}