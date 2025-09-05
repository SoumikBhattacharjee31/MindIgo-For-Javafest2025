package com.mindigo.discussion_service.controller;

import com.mindigo.discussion_service.dto.request.*;
import com.mindigo.discussion_service.dto.response.*;
import com.mindigo.discussion_service.entity.CommentSortType;
import com.mindigo.discussion_service.entity.PostCategory;
import com.mindigo.discussion_service.entity.UserRole;
import com.mindigo.discussion_service.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/discussion")
@Tag(name = "Discussion", description = "Discussion forum endpoints")
@Slf4j
public class DiscussionController {

    private final DiscussionService discussionService;

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint")
    public ResponseEntity<ApiResponseClass<TestResponse>> healthCheck() {
        TestResponse test = TestResponse.builder()
                .api("api/v1/discussion/health")
                .status("UP")
                .timestamp(System.currentTimeMillis())
                .build();

        return ResponseEntity.ok(ApiResponseClass.<TestResponse>builder()
                .success(true)
                .data(test)
                .message("Discussion service is healthy")
                .build());
    }

    // Post endpoints
    @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new post")
    @ApiResponse(responseCode = "201", description = "Post created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @ApiResponse(responseCode = "403", description = "User is restricted")
    public ResponseEntity<ApiResponseClass<PostResponse>> createPost(
            @RequestPart("post") @Valid CreatePostRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            HttpServletRequest httpRequest) {

        log.info("Creating post with title: {}", request.getTitle());

        PostResponse postResponse = discussionService.createPost(request, images, httpRequest);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.<PostResponse>builder()
                        .success(true)
                        .data(postResponse)
                        .message("Post created successfully")
                        .build());
    }

    @GetMapping("/posts")
    @Operation(summary = "Get posts with filtering and sorting")
    @ApiResponse(responseCode = "200", description = "Posts retrieved successfully")
    public ResponseEntity<ApiResponseClass<Page<PostResponse>>> getPosts(
            @RequestParam(value = "category", required = false) PostCategory category,
            @RequestParam(value = "authorRole", required = false) UserRole authorRole,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "sortBy", defaultValue = "newest") String sortBy,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        Page<PostResponse> posts = discussionService.getPosts(category, authorRole, keyword, sortBy, page, size, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Page<PostResponse>>builder()
                .success(true)
                .data(posts)
                .message("Posts retrieved successfully")
                .build());
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Get post by ID")
    @ApiResponse(responseCode = "200", description = "Post retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<PostResponse>> getPostById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        PostResponse post = discussionService.getPostById(id, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<PostResponse>builder()
                .success(true)
                .data(post)
                .message("Post retrieved successfully")
                .build());
    }

    @PutMapping(value = "/posts/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update a post")
    @ApiResponse(responseCode = "200", description = "Post updated successfully")
    @ApiResponse(responseCode = "403", description = "Not authorized to edit this post")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<PostResponse>> updatePost(
            @PathVariable Long id,
            @RequestPart("post") @Valid UpdatePostRequest request,
            @RequestPart(value = "newImages", required = false) List<MultipartFile> newImages,
            HttpServletRequest httpRequest) {

        PostResponse updatedPost = discussionService.updatePost(id, request, newImages, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<PostResponse>builder()
                .success(true)
                .data(updatedPost)
                .message("Post updated successfully")
                .build());
    }

    @DeleteMapping("/posts/{id}")
    @Operation(summary = "Delete a post")
    @ApiResponse(responseCode = "200", description = "Post deleted successfully")
    @ApiResponse(responseCode = "403", description = "Not authorized to delete this post")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<Void>> deletePost(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        discussionService.deletePost(id, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Post deleted successfully")
                .build());
    }

    // Comment endpoints
    @PostMapping("/posts/{postId}/comments")
    @Operation(summary = "Create a comment on a post")
    @ApiResponse(responseCode = "201", description = "Comment created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    @ApiResponse(responseCode = "403", description = "User is restricted")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<CommentResponse>> createComment(
            @PathVariable Long postId,
            @RequestBody @Valid CreateCommentRequest request,
            HttpServletRequest httpRequest) {

        CommentResponse comment = discussionService.createComment(postId, request, httpRequest);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseClass.<CommentResponse>builder()
                        .success(true)
                        .data(comment)
                        .message("Comment created successfully")
                        .build());
    }

    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "Get comments for a post")
    @ApiResponse(responseCode = "200", description = "Comments retrieved successfully")
    public ResponseEntity<ApiResponseClass<Page<CommentResponse>>> getComments(
            @PathVariable Long postId,
            @RequestParam(value = "sortBy", defaultValue = "NEWEST") CommentSortType sortBy,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            HttpServletRequest httpRequest) {

        Page<CommentResponse> comments = discussionService.getComments(postId, sortBy, page, size, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Page<CommentResponse>>builder()
                .success(true)
                .data(comments)
                .message("Comments retrieved successfully")
                .build());
    }

    @GetMapping("/comments/{commentId}/replies")
    @Operation(summary = "Get replies to a comment")
    @ApiResponse(responseCode = "200", description = "Replies retrieved successfully")
    public ResponseEntity<ApiResponseClass<List<CommentResponse>>> getCommentReplies(
            @PathVariable Long commentId,
            HttpServletRequest httpRequest) {

        List<CommentResponse> replies = discussionService.getCommentReplies(commentId, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<List<CommentResponse>>builder()
                .success(true)
                .data(replies)
                .message("Replies retrieved successfully")
                .build());
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete a comment")
    @ApiResponse(responseCode = "200", description = "Comment deleted successfully")
    @ApiResponse(responseCode = "403", description = "Not authorized to delete this comment")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public ResponseEntity<ApiResponseClass<Void>> deleteComment(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {

        discussionService.deleteComment(id, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Comment deleted successfully")
                .build());
    }

    // Reaction endpoints
    @PostMapping("/posts/{postId}/react")
    @Operation(summary = "React to a post")
    @ApiResponse(responseCode = "200", description = "Reaction added/updated successfully")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<ReactionSummaryResponse>> reactToPost(
            @PathVariable Long postId,
            @RequestBody @Valid ReactToPostRequest request,
            HttpServletRequest httpRequest) {

        ReactionSummaryResponse summary = discussionService.reactToPost(postId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<ReactionSummaryResponse>builder()
                .success(true)
                .data(summary)
                .message("Reaction updated successfully")
                .build());
    }

    @PostMapping("/comments/{commentId}/react")
    @Operation(summary = "React to a comment")
    @ApiResponse(responseCode = "200", description = "Reaction added/updated successfully")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public ResponseEntity<ApiResponseClass<ReactionSummaryResponse>> reactToComment(
            @PathVariable Long commentId,
            @RequestBody @Valid ReactToCommentRequest request,
            HttpServletRequest httpRequest) {

        ReactionSummaryResponse summary = discussionService.reactToComment(commentId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<ReactionSummaryResponse>builder()
                .success(true)
                .data(summary)
                .message("Reaction updated successfully")
                .build());
    }

    // Report endpoints
    @PostMapping("/posts/{postId}/report")
    @Operation(summary = "Report a post")
    @ApiResponse(responseCode = "200", description = "Post reported successfully")
    @ApiResponse(responseCode = "400", description = "Already reported or invalid input")
    @ApiResponse(responseCode = "404", description = "Post not found")
    public ResponseEntity<ApiResponseClass<Void>> reportPost(
            @PathVariable Long postId,
            @RequestBody @Valid ReportPostRequest request,
            HttpServletRequest httpRequest) {

        discussionService.reportPost(postId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Post reported successfully")
                .build());
    }

    @PostMapping("/comments/{commentId}/report")
    @Operation(summary = "Report a comment")
    @ApiResponse(responseCode = "200", description = "Comment reported successfully")
    @ApiResponse(responseCode = "400", description = "Already reported or invalid input")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public ResponseEntity<ApiResponseClass<Void>> reportComment(
            @PathVariable Long commentId,
            @RequestBody @Valid ReportCommentRequest request,
            HttpServletRequest httpRequest) {

        discussionService.reportComment(commentId, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<Void>builder()
                .success(true)
                .message("Comment reported successfully")
                .build());
    }

    @PutMapping("/comments/{id}")
    @Operation(summary = "Update a comment")
    @ApiResponse(responseCode = "200", description = "Comment updated successfully")
    @ApiResponse(responseCode = "403", description = "Not authorized to edit this comment")
    @ApiResponse(responseCode = "404", description = "Comment not found")
    public ResponseEntity<ApiResponseClass<CommentResponse>> updateComment(
            @PathVariable Long id,
            @RequestBody @Valid UpdateCommentRequest request,
            HttpServletRequest httpRequest) {

        CommentResponse updatedComment = discussionService.updateComment(id, request, httpRequest);

        return ResponseEntity.ok(ApiResponseClass.<CommentResponse>builder()
                .success(true)
                .data(updatedComment)
                .message("Comment updated successfully")
                .build());
    }
}