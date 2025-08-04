package com.example.mindigo.user.repositories;

import com.example.mindigo.user.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UserTokenRepository extends JpaRepository<UserToken, Integer> {
    UserToken findUserByToken(String token);
}
