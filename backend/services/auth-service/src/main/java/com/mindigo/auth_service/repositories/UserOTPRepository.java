package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.entity.UserOTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserOTPRepository extends JpaRepository<UserOTP, Integer> {
    Optional<UserOTP> findByEmail(String email);
    UserOTP findUserByEmail(String email);
    Optional<UserOTP> findByEmailAndExpiryTimeAfter(String email, LocalDateTime time);
    void deleteByEmailAndExpiryTimeBefore(String email, LocalDateTime time);
}

