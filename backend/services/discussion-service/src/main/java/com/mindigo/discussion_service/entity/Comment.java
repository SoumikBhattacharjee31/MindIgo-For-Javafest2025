package com.mindigo.discussion_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false)
    private String authorEmail;

    @Column(nullable = false)
    private String authorName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole authorRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private Long parentCommentId; // For nested replies

    @Builder.Default
    private Integer reactionCount = 0;

    @Builder.Default
    private Integer replyCount = 0;

    @Builder.Default
    private Integer reportCount = 0;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private Boolean isReported = false;

    private String moderationReason;

    private Long moderatedBy;

    private LocalDateTime moderatedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}