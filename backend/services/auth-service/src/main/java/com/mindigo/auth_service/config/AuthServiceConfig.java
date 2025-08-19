package com.mindigo.auth_service.config;

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

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository) {
        return args -> {
            // Check if admin user already exists
            String adminEmail = "admin@mindigo.com";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = User.builder()
                        .name("Admin User")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("adminPassword123")) // Encode the password
                        .role(Role.ADMIN)
                        .dateOfBirth(LocalDate.of(1980, 1, 1)) // Example DOB
                        .gender(Gender.MALE) // Example gender
                        .isEmailVerified(true) // Mark as verified
                        .isActive(true)
                        .isLocked(false)
                        .failedLoginAttempts(0)
                        .createdBy("SYSTEM")
                        .updatedBy("SYSTEM")
                        .build();
                userRepository.save(admin);
                System.out.println("Admin user created: " + adminEmail);
            } else {
                System.out.println("Admin user already exists: " + adminEmail);
            }
        };
    }
}