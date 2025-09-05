package com.mindigo.discussion_service.dto.response;

import com.mindigo.discussion_service.entity.PostCategory;
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
public class PostResponse {
    private Long id;
    private Long authorId;
    private String authorName;
    private UserRole authorRole;
    private String title;
    private String content;
    private PostCategory category;
    private List<String> imageUrls;
    private Integer reactionCount;
    private Integer commentCount;
    private Map<String, Integer> reactionBreakdown; // ReactionType -> count
    private Boolean hasUserReacted;
    private String userReactionType;
    private Boolean canEdit; // true if current user is the author
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}