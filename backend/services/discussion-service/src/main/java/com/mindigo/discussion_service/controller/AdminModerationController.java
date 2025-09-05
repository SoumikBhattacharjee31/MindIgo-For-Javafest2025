package com.mindigo.discussion_service.controller;

import com.mindigo.discussion_service.dto.request.ModerationRequest;
import com.mindigo.discussion_service.dto.request.RestrictUserRequest;
import com.mindigo.discussion_service.dto.response.ApiResponseClass;
import com.mindigo.discussion_service.dto.response.DiscussionStatsResponse;
import com.mindigo.discussion_service.dto.response.ReportResponse;
import com.mindigo.discussion_service.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/discussion/admin")
@Tag(name = "Discussion Admin", description = "Admin moderation endpoints for discussion service")
@Slf4j
public class AdminModerationController {

    private final DiscussionService discussionService;

    @GetMapping("/stats")
    @Operation(summary = "Get discussion service statistics")
    @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Admin access required")
    public ResponseEntity<ApiResponseClass<DiscussionStatsResponse>> getDiscussionStats(
            HttpServletRequest httpRequest) {

        DiscussionStatsResponse stats = discussionService.getDiscussionStats(httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<DiscussionStatsResponse>builder()
                .success(true)
                .data(stats)
                .message("Discussion statistics retrieved successfully")
                .build());
    }

    @GetMapping("/reports/posts")
    @Operation(summary = "Get post reports for admin review")
    @ApiResponse(responseCode = "200", description = "Post reports retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Admin access required")
    public ResponseEntity<ApiResponseClass<Page<ReportResponse>>> getPostReports(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        Page<ReportResponse> reports = discussionService.getPostReports(page, size, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Page<ReportResponse>>builder()
                .success(true)
                .data(reports)
                .message("Post reports retrieved successfully")
                .build());
    }

    @GetMapping("/reports/comments")
    @Operation(summary = "Get comment reports for admin review")
    @ApiResponse(responseCode = "200", description = "Comment reports retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Admin access required")
    public ResponseEntity<ApiResponseClass<Page<ReportResponse>>> getCommentReports(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        Page<ReportResponse> reports = discussionService.getCommentReports(page, size, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Page<ReportResponse>>builder()
                .success(true)
                .data(reports)
                .message("Comment reports retrieved successfully")
                .build());
    }

    @PostMapping("/posts/{postId}/moderate")
    @Operation(summary = "Moderate (remove) a post")
    @ApiResponse(responseCode = "200", description = "Post moderated successfully")
    @ApiResponse(responseCode = "403", description = "Admin access required")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<Void>> moderatePost(
            @PathVariable Long postId,
            @RequestBody @Valid ModerationRequest request,
            HttpServletRequest httpRequest) {

        log.info("Admin moderating post ID: {}", postId);

        discussionService.moderatePost(postId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Post moderated successfully")
                .build());
    }

    @PostMapping("/comments/{commentId}/moderate")
    @Operation(summary = "Moderate (remove) a comment")
    @ApiResponse(responseCode = "200", description = "Comment moderated successfully")
    @ApiResponse(responseCode = "403", description = "Admin access required")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public ResponseEntity<ApiResponseClass<Void>> moderateComment(
            @PathVariable Long commentId,
            @RequestBody @Valid ModerationRequest request,
            HttpServletRequest httpRequest) {

        log.info("Admin moderating comment ID: {}", commentId);

        discussionService.moderateComment(commentId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Comment moderated successfully")
                .build());
    }

    @PostMapping("/users/{userId}/restrict")
    @Operation(summary = "Restrict a user from posting/commenting")
    @ApiResponse(responseCode = "200", description = "User restricted successfully")
    @ApiResponse(responseCode = "403", description = "Admin access required")
    public ResponseEntity<ApiResponseClass<Void>> restrictUser(
            @PathVariable Long userId,
            @RequestBody @Valid RestrictUserRequest request,
            HttpServletRequest httpRequest) {

        log.info("Admin restricting user ID: {} for {} hours", userId, request.getDurationInHours());

        discussionService.restrictUser(userId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("User restricted successfully")
                .build());
    }
}