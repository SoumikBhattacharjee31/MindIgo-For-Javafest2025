package com.mindigo.content_service.repositories.quiz;

import com.mindigo.content_service.models.quiz.UserQuizCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserQuizCompletionRepository extends JpaRepository<UserQuizCompletion, Long> {

    Optional<UserQuizCompletion> findByUserIdAndQuizCode(String userId, String quizCode);

    @Query("SELECT c FROM UserQuizCompletion c WHERE c.quizCode = :quizCode")
    List<UserQuizCompletion> findByQuizCode(@Param("quizCode") String quizCode);
}