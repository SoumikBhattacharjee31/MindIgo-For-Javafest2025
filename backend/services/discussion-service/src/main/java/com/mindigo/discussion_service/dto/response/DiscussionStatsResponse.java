package com.mindigo.discussion_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionStatsResponse {
    private Long totalPosts;
    private Long totalComments;
    private Long totalReactions;
    private Long pendingReports;
    private Long activeRestrictions;
    private Long postsToday;
    private Long commentsToday;
}