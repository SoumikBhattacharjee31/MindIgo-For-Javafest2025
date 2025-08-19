package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.request.MailSendRequest;
import com.mindigo.auth_service.dto.response.MailSendResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {

    @Autowired
    public RestTemplate restTemplate;

    public void sendPasswordChangeConfirmationEmail(String email, String userName) {
        sendMail(email, "Password Change Confirmation", "Password for user "+userName+" changed successfully");
    }

    public void sendPasswordResetEmail(String email, String userName, String resetUrl) {
        sendMail(email, "Password Reset Link", "Password reset link for user "+userName+": "+resetUrl);
    }

    public void sendOtpEmail(String email, String userName, String otp) {
        sendMail(email, "OTP for Signing Up", "Dear "+userName+", use this otp to complete your signup: "+otp);
    }

    public void sendCounselorRegistrationConfirmation(String email, String userName) {
        sendMail(email, "Registration is pending", "Dear "+userName+", Please wait for an admin to approve you request");
    }

    public void sendMail(String receiver, String subject, String body) {
        try {

            MailSendRequest mailRequest = new MailSendRequest(receiver, subject, body);
            String mailServiceUrl = "http://MAIL-SERVICE/api/v1/mail/send-mail"; // Adjust to your mail-service URL
            ResponseEntity<MailSendResponse> mailResponse = restTemplate.postForEntity(mailServiceUrl, mailRequest, MailSendResponse.class);

            if (mailResponse.getStatusCode() != HttpStatus.OK || mailResponse.getBody() == null)
                throw new RuntimeException("Failed to send email: Invalid response from mail-service");
            if (mailResponse.getBody().getStatus().startsWith("Failed"))
                throw new RuntimeException("Failed to send email: " + mailResponse.getBody().getStatus());

        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with mail-service: " + e.getMessage());
        }
    }

    // Add these methods to your existing EmailService class

    public void sendCounselorApprovalEmail(String email, String userName) {
        sendMail(email, "Counselor Account Approved",
                "Dear " + userName + ", your counselor account has been approved! You can now log in and start providing counseling services.");
    }

    public void sendCounselorRejectionEmail(String email, String userName, String reason) {
        String body = "Dear " + userName + ", unfortunately your counselor application has been rejected.";
        if (reason != null && !reason.trim().isEmpty()) {
            body += " Reason: " + reason;
        }
        body += " Please contact support if you have any questions.";

        sendMail(email, "Counselor Application Rejected", body);
    }

    public void sendCounselorAdditionalInfoEmail(String email, String userName, String requiredInfo) {
        String body = "Dear " + userName + ", we need additional information for your counselor application.";
        if (requiredInfo != null && !requiredInfo.trim().isEmpty()) {
            body += " Details: " + requiredInfo;
        }
        body += " Please provide the requested information to complete your application.";

        sendMail(email, "Additional Information Required", body);
    }
}
