// ValidateResponse.java
package com.mindigo.auth_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateResponse {
    private Long userId;
    private String email;
    private boolean valid;
    private String role;
    private String userName;
}