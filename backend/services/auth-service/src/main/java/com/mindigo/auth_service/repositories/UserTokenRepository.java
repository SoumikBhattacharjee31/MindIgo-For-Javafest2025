package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.models.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserTokenRepository extends JpaRepository<UserToken, Integer> {
    UserToken findUserByToken(String token);
}
