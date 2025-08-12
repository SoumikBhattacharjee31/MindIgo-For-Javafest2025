package com.mindigo.auth_service.dto.response;

import com.mindigo.auth_service.entity.CounselorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CounselorStatusResponse {
    private CounselorStatus status;
    private String verificationNotes;
    private LocalDateTime verifiedAt;
    private boolean canLogin;
}