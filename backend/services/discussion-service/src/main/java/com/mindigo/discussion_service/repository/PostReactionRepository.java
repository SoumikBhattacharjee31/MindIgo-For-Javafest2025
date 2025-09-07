package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.PostReaction;
import com.mindigo.discussion_service.entity.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {

    Optional<PostReaction> findByPostIdAndUserId(Long postId, Long userId);

    Long countByPostId(Long postId);

    @Query("SELECT pr.reactionType, COUNT(pr) FROM PostReaction pr WHERE pr.postId = :postId GROUP BY pr.reactionType")
    List<Object[]> countReactionsByPostId(@Param("postId") Long postId);

    List<PostReaction> findByPostId(Long postId);

    void deleteByPostIdAndUserId(Long postId, Long userId);
}