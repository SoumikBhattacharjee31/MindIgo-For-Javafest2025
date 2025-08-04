package com.example.mindigo.user.repositories;

import com.example.mindigo.user.UserOTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOTPRepository extends JpaRepository<UserOTP, Integer> {
    Optional<UserOTP> findByEmail(String email);
    UserOTP findUserByEmail(String email);
}

