package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.CommentReaction;
import com.mindigo.discussion_service.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {

    Optional<CommentReaction> findByCommentIdAndUserId(Long commentId, Long userId);

    Long countByCommentId(Long commentId);

    @Query("SELECT cr.reactionType, COUNT(cr) FROM CommentReaction cr WHERE cr.commentId = :commentId GROUP BY cr.reactionType")
    List<Object[]> countReactionsByCommentId(@Param("commentId") Long commentId);

    List<CommentReaction> findByCommentId(Long commentId);

    void deleteByCommentIdAndUserId(Long commentId, Long userId);
}