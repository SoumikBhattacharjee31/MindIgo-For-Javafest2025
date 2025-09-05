package com.mindigo.discussion_service.dto.response;

import com.mindigo.discussion_service.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorName;
    private UserRole authorRole;
    private String content;
    private Long parentCommentId;
    private Integer reactionCount;
    private Integer replyCount;
    private Map<String, Integer> reactionBreakdown;
    private Boolean hasUserReacted;
    private String userReactionType;
    private Boolean canEdit;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}