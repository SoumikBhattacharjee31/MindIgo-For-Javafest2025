package com.mindigo.auth_service.config;

import com.mindigo.auth_service.entity.CounselorStatus;
import com.mindigo.auth_service.entity.Gender;
import com.mindigo.auth_service.entity.Role;
import com.mindigo.auth_service.entity.User;
import com.mindigo.auth_service.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDate;

@Configuration
public class AuthServiceConfig {

    @Autowired
    private PasswordEncoder passwordEncoder; // Ensure PasswordEncoder is configured in your SecurityConfig

    private void makeUser(UserRepository userRepository, String role, int number) {
        String email = role.toLowerCase()+String.valueOf(number)+"@mindigo.com";
        String name = "User" + role.toLowerCase()+String.valueOf(number);
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("password")) // Encode the password
                    .role(Role.valueOf(role))
                    .dateOfBirth(LocalDate.of(1980, 1, 1)) // Example DOB
                    .gender(Gender.MALE) // Example gender
                    .isEmailVerified(true) // Mark as verified
                    .isActive(true)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .createdBy("SYSTEM")
                    .updatedBy("SYSTEM")
                    .counselorStatus(CounselorStatus.APPROVED)
                    .build();
            userRepository.save(user);
            System.out.println("User created: " + email);
        } else {
            System.out.println("User already exists: " + email);
        }
    }

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository) {
        return args -> {
            for(int i=0;i<10;i++){
                makeUser(userRepository,"USER",i);
                makeUser(userRepository,"ADMIN",i);
                makeUser(userRepository,"COUNSELOR",i);
            }
        };
    }
}