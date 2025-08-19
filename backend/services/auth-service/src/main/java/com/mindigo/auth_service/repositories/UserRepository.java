package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.entity.CounselorStatus;
import com.mindigo.auth_service.entity.Role;
import com.mindigo.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    User findUserByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByLicenseNumber(String licenseNumber);
    List<User> findByRoleAndCounselorStatus(Role role, CounselorStatus status);
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.provider = 'LOCAL'")
    Optional<User> findByEmailAndLocalProvider(@Param("email") String email);
}
