package com.mindigo.content_service.models.quiz;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserQuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String quizCode;

    @Column(nullable = false)
    private Integer currentQuestionSequence = 1;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @CreationTimestamp
    @Column( nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<UserQuizAnswer> answers;



    public Double getProgressPercentage() {
        if (totalQuestions == 0) return 0.0;
        return ((double) (currentQuestionSequence - 1) / totalQuestions) * 100;
    }

    public Boolean isCompleted() {
        return status == SessionStatus.COMPLETED;
    }
}