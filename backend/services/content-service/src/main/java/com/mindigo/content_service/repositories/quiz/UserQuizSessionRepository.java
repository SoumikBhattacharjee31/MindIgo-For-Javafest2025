package com.mindigo.content_service.repositories.quiz;

import com.mindigo.content_service.models.quiz.SessionStatus;
import com.mindigo.content_service.models.quiz.UserQuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuizSessionRepository extends JpaRepository<UserQuizSession, Long> {

    Optional<UserQuizSession> findByUserIdAndQuizCodeAndStatus(String userId, String quizCode, SessionStatus status);

    List<UserQuizSession> findByUserIdOrderByStartedAtDesc(String userId);

    @Query("SELECT s FROM UserQuizSession s WHERE s.userId = :userId AND s.quizCode = :quizCode ORDER BY s.startedAt DESC")
    List<UserQuizSession> findByUserIdAndQuizCodeOrderByStartedAtDesc(
            @Param("userId") String userId,
            @Param("quizCode") String quizCode
    );

    @Query("SELECT COUNT(s) FROM UserQuizSession s WHERE s.userId = :userId AND s.status = :status")
    Long countByUserIdAndStatus(@Param("userId") String userId, @Param("status") SessionStatus status);
}