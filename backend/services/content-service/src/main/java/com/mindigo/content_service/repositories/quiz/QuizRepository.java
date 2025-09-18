package com.mindigo.content_service.repositories.quiz;

import com.mindigo.content_service.models.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.quizCode = :quizCode")
    Integer countByQuizCode(@Param("quizCode") String quizCode);

    @Query("SELECT q FROM Quiz q WHERE q.quizCode = :quizCode AND q.sequenceNumber = :sequenceNumber")
    Optional<Quiz> findByQuizCodeAndSequenceNumber(
            @Param("quizCode") String quizCode,
            @Param("sequenceNumber") Integer sequenceNumber
    );

    @Query("SELECT DISTINCT q.quizCode FROM Quiz q")
    List<String> findDistinctQuizCodes();

    Boolean existsByQuizCode(String quizCode);

    Boolean existsByFileId(String fileId);

    Optional<Quiz> findFirstByQuizCodeOrderBySequenceNumberAsc(String quizCode);
}