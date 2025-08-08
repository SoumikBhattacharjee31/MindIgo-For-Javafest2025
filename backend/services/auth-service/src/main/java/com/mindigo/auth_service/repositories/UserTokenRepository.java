package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.entity.TokenType;
import com.mindigo.auth_service.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;


public interface UserTokenRepository extends JpaRepository<UserToken, Integer> {
    UserToken findUserByToken(String token);
    void deleteByEmailAndExpiryTimeBefore(String email, LocalDateTime expiryTime);
    List<UserToken> findByTokenTypeAndExpiryTimeAfter(TokenType type, LocalDateTime time);
}
