package com.mindigo.mail_service.services;

import com.mindigo.mail_service.dto.MailSendRequest;
import com.mindigo.mail_service.dto.MailSendResponse;
import com.mindigo.mail_service.exceptions.InvalidEmailException;
import com.mindigo.mail_service.exceptions.MailServerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public MailSendResponse sendEmail(MailSendRequest request) {
        validateRequest(request);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sender);
            message.setTo(request.getReceiver());
            message.setSubject(request.getSubject());
            message.setText(request.getBody());
            mailSender.send(message);
            return MailSendResponse.builder()
                    .status("Successfully Sent")
                    .build();
        } catch (MailAuthenticationException e) {
            throw new MailServerException("Authentication failed: Invalid mail server credentials");
        } catch (MailSendException e) {
            throw new MailServerException("Failed to send email: " + e.getMessage());
        } catch (MailException e) {
            throw new MailServerException("Mail server error: " + e.getMessage());
        }
    }

    private void validateRequest(MailSendRequest request) {
        if (request.getReceiver() == null || request.getReceiver().trim().isEmpty()) {
            throw new InvalidEmailException("Receiver email cannot be empty");
        }
        if (!isValidEmailFormat(request.getReceiver())) {
            throw new InvalidEmailException("Invalid receiver email format");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new InvalidEmailException("Subject cannot be empty");
        }
        if (request.getBody() == null || request.getBody().trim().isEmpty()) {
            throw new InvalidEmailException("Email body cannot be empty");
        }
    }

    private boolean isValidEmailFormat(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email != null && email.matches(emailRegex);
    }
}