package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.RestrictionType;
import com.mindigo.discussion_service.entity.UserRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRestrictionRepository extends JpaRepository<UserRestriction, Long> {

    @Query("SELECT ur FROM UserRestriction ur WHERE ur.userId = :userId AND ur.restrictionType = :type " +
            "AND ur.isActive = true AND ur.endDate > :now ORDER BY ur.endDate DESC")
    Optional<UserRestriction> findActiveRestriction(
            @Param("userId") Long userId,
            @Param("type") RestrictionType type,
            @Param("now") LocalDateTime now);

    @Query("SELECT ur FROM UserRestriction ur WHERE ur.userId = :userId AND ur.isActive = true AND ur.endDate > :now")
    List<UserRestriction> findActiveRestrictionsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    List<UserRestriction> findByUserIdOrderByCreatedAtDesc(Long userId);
}