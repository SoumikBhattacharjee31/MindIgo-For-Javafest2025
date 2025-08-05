package com.mindigo.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MailSendRequest {
    @NotBlank(message = "Receiver email is required")
    @Email(message = "Invalid email format")
    String receiver;

    @NotBlank(message = "Subject is required")
    String subject;

    @NotBlank(message = "Body is required")
    String body;
}
