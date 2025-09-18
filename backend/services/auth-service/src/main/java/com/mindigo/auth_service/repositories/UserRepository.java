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
    @Override
    Optional<User> findById(Integer integer);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // 🛑 This method is removed as licenseNumber is now in the Counselor entity
    // boolean existsByLicenseNumber(String licenseNumber);

    // ✅ This query is updated to JOIN with the counselorDetails relationship
    @Query("SELECT u FROM User u JOIN u.counselorDetails cd WHERE u.role = :role AND cd.counselorStatus = :status")
    List<User> findByRoleAndCounselorStatus(@Param("role") Role role, @Param("status") CounselorStatus status);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.provider = 'LOCAL'")
    Optional<User> findByEmailAndLocalProvider(@Param("email") String email);

    List<User> findByRole(Role role);

    // ++ Add these new methods for statistics ++
    /**
     * Counts the total number of users with a specific role.
     * @param role The role to count.
     * @return The total count of users with the given role.
     */
    long countByRole(Role role);

    /**
     * Counts the total number of users based on their active status.
     * @param isActive The active status to count (true for active, false for inactive).
     * @return The total count of users with the given active status.
     */
    long countByIsActive(boolean isActive);
}