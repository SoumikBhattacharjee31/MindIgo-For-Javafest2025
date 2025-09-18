package com.mindigo.content_service.repositories.quiz;

import com.mindigo.content_service.models.quiz.UserQuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuizAnswerRepository extends JpaRepository<UserQuizAnswer, Long> {

    List<UserQuizAnswer> findBySessionIdOrderByQuiz_SequenceNumberAsc(Long sessionId);

    Optional<UserQuizAnswer> findBySessionIdAndQuizId(Long sessionId, Long quizId);

    @Query("SELECT COUNT(a) FROM UserQuizAnswer a WHERE a.session.id = :sessionId")
    Integer countBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT a FROM UserQuizAnswer a WHERE a.userId = :userId AND a.quiz.quizCode = :quizCode ORDER BY a.quiz.sequenceNumber")
    List<UserQuizAnswer> findByUserIdAndQuizCodeOrderBySequence(
            @Param("userId") String userId,
            @Param("quizCode") String quizCode
    );
}