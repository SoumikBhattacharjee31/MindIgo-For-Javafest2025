package com.mindigo.auth_service.config;

import com.mindigo.auth_service.entity.*; // Import Counselor entity
import com.mindigo.auth_service.repositories.CounselorRepository; // ✅ Import new repository
import com.mindigo.auth_service.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime; // Import LocalDateTime

@Configuration
public class AuthServiceConfig {

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ✅ Method signature updated to accept CounselorRepository
    private void makeUser(UserRepository userRepository, CounselorRepository counselorRepository, String role, int number) {
        String email = role.toLowerCase() + number + "@mindigo.com";
        String name = "User" + role.toLowerCase() + number;

        if (userRepository.findByEmail(email).isEmpty()) {
            // 1. Build the standard User object without any counselor-specific fields
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.valueOf(role))
                    .dateOfBirth(LocalDate.of(1980, 1, 1))
                    .gender(Gender.MALE)
                    .isEmailVerified(true)
                    .isActive(true)
                    .isLocked(false)
                    .failedLoginAttempts(0)
                    .createdBy("SYSTEM")
                    .updatedBy("SYSTEM")
                    // 🛑 Removed .counselorStatus(CounselorStatus.APPROVED)
                    .build();

            // 2. If the role is COUNSELOR, create and attach the Counselor details
            if (role.equals("COUNSELOR")) {
                Counselor counselorDetails = Counselor.builder()
                        .user(user) // Important: Link back to the user object
                        .licenseNumber("DUMMY-LN-" + number)
                        .specialization("General Wellness")
                        .counselorStatus(CounselorStatus.APPROVED)
                        .acceptsInsurance(true)
                        .adminVerifiedBy(1L) // Dummy admin ID
                        .adminVerifiedAt(LocalDateTime.now())
                        .verificationNotes("Automatically approved by system seeder.")
                        .build();

                // Set the relationship on the User side
                user.setCounselorDetails(counselorDetails);
            }

            // 3. Save the User. Cascade will handle saving the Counselor object if it exists.
            userRepository.save(user);
            System.out.println("User created: " + email);
        } else {
            System.out.println("User already exists: " + email);
        }
    }

    @Bean
    // ✅ Updated to inject both repositories
    public CommandLineRunner initAdminUser(UserRepository userRepository, CounselorRepository counselorRepository) {
        return args -> {
            System.out.println("--- Seeding initial user data ---");
            for (int i = 0; i < 10; i++) {
                // ✅ Pass both repositories to the helper method
                makeUser(userRepository, counselorRepository, "USER", i);
                makeUser(userRepository, counselorRepository, "ADMIN", i);
                makeUser(userRepository, counselorRepository, "COUNSELOR", i);
            }
            System.out.println("--- Seeding complete ---");
        };
    }
}