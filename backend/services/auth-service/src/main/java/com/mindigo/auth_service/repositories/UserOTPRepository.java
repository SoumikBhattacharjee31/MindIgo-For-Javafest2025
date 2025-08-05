package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.models.UserOTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOTPRepository extends JpaRepository<UserOTP, Integer> {
    Optional<UserOTP> findByEmail(String email);
    UserOTP findUserByEmail(String email);
}

