package com.mindigo.mail_service.controllers;

import com.mindigo.mail_service.dto.MailSendRequest;
import com.mindigo.mail_service.dto.MailSendResponse;
import com.mindigo.mail_service.dto.TestResponse;
import com.mindigo.mail_service.exceptions.InvalidEmailException;
import com.mindigo.mail_service.exceptions.MailServerException;
import com.mindigo.mail_service.services.MailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mail")
@Validated
public class MailController {
    @Autowired
    private MailService mailService;

    @GetMapping("/test")
    public ResponseEntity<TestResponse> testingPath(){
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/mail/test")
                .status("UP").build();
        return ResponseEntity.ok(test);
    }

    @PostMapping("/send-mail")
    public ResponseEntity<MailSendResponse> sendMail(@Valid @RequestBody MailSendRequest mailSendRequest) {
        try {
            MailSendResponse response = mailService.sendEmail(mailSendRequest);
            return ResponseEntity.ok(response);
        } catch (InvalidEmailException e) {
            return ResponseEntity.badRequest()
                    .body(MailSendResponse.builder()
                            .status("Failed: " + e.getMessage())
                            .build());
        } catch (MailServerException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(MailSendResponse.builder()
                            .status("Failed: Mail server error")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MailSendResponse.builder()
                            .status("Failed: Unexpected error occurred")
                            .build());
        }
    }
}
