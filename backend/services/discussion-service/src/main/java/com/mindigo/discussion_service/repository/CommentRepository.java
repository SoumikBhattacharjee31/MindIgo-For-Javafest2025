package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.Comment;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByCreatedAtDesc(
            Long postId, Pageable pageable);

    List<Comment> findByParentCommentIdAndIsActiveTrueOrderByCreatedAtAsc(Long parentCommentId);

    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND c.isActive = true AND c.parentCommentId IS NULL " +
            "ORDER BY c.reactionCount DESC, c.createdAt DESC")
    Page<Comment> findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByReactionCountDesc(
            @Param("postId") Long postId, Pageable pageable);

    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND c.isActive = true AND c.parentCommentId IS NULL " +
            "ORDER BY c.replyCount DESC, c.createdAt DESC")
    Page<Comment> findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByReplyCountDesc(
            @Param("postId") Long postId, Pageable pageable);

    Long countByPostIdAndIsActiveTrue(Long postId);

    Long countByParentCommentIdAndIsActiveTrue(Long parentCommentId);

    List<Comment> findByAuthorIdAndIsActiveTrue(Long authorId);

    Page<Comment> findByIsReportedTrueAndIsActiveTrue(Pageable pageable);

    Long countByAuthorIdAndCreatedAtAfter(Long authorId, LocalDateTime after);

    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.reactionCount = :count WHERE c.id = :commentId")
    void updateReactionCount(@Param("commentId") Long commentId, @Param("count") Integer count);

    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.replyCount = :count WHERE c.id = :commentId")
    void updateReplyCount(@Param("commentId") Long commentId, @Param("count") Integer count);

    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.reportCount = :count, c.isReported = :isReported WHERE c.id = :commentId")
    void updateReportCount(@Param("commentId") Long commentId, @Param("count") Integer count, @Param("isReported") Boolean isReported);

}