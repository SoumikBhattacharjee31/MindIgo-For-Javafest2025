package com.mindigo.admin_service.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserStatsResponse {
    private long totalUsers;
    private long totalCounselors;
    private long totalActiveUsers;
}