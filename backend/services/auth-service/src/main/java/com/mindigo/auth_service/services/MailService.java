package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.MailSendRequest;
import com.mindigo.auth_service.dto.MailSendResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class MailService {

    @Autowired
    public RestTemplate restTemplate;

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
}
