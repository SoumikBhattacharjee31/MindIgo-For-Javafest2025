package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.Post;
import com.mindigo.discussion_service.entity.PostCategory;
import com.mindigo.discussion_service.entity.UserRole;
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
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByIsActiveTrueAndCategoryOrderByCreatedAtDesc(PostCategory category, Pageable pageable);

    Page<Post> findByIsActiveTrueAndAuthorRoleOrderByCreatedAtDesc(UserRole authorRole, Pageable pageable);

    Page<Post> findByIsActiveTrueAndCategoryAndAuthorRoleOrderByCreatedAtDesc(
            PostCategory category, UserRole authorRole, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.isActive = true AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> findByKeywordAndIsActiveTrue(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.isActive = true AND p.category = :category AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> findByKeywordAndCategoryAndIsActiveTrue(
            @Param("keyword") String keyword,
            @Param("category") PostCategory category,
            Pageable pageable);

    List<Post> findByAuthorIdAndIsActiveTrue(Long authorId);

    Page<Post> findByIsReportedTrueAndIsActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.isActive = true ORDER BY p.reactionCount DESC, p.createdAt DESC")
    Page<Post> findByIsActiveTrueOrderByReactionCountDesc(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.isActive = true ORDER BY p.commentCount DESC, p.createdAt DESC")
    Page<Post> findByIsActiveTrueOrderByCommentCountDesc(Pageable pageable);

    Long countByAuthorIdAndCreatedAtAfter(Long authorId, LocalDateTime after);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.reactionCount = :count WHERE p.id = :postId")
    void updateReactionCount(@Param("postId") Long postId, @Param("count") Integer count);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.commentCount = :count WHERE p.id = :postId")
    void updateCommentCount(@Param("postId") Long postId, @Param("count") Integer count);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.reportCount = :count, p.isReported = :isReported WHERE p.id = :postId")
    void updateReportCount(@Param("postId") Long postId, @Param("count") Integer count, @Param("isReported") Boolean isReported);

}