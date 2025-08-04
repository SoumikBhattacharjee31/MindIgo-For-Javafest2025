package com.example.mindigo.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


    @Service
    public class EmailSenderService {
        @Autowired
        private JavaMailSender mailSender;

        @Async
        public void sendEmail(String toEmail,
                              String Subject,
                              String body){
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("legendaryknightsomik@gmail.com");
            message.setTo(toEmail);
            message.setText(body);
            message.setSubject(Subject);

            mailSender.send(message);
            System.out.println("Successfully Sent...");
        }
    }


