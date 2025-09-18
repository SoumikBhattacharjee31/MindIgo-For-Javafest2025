// DiscussionService.java
package com.mindigo.discussion_service.service;

import com.mindigo.discussion_service.dto.request.*;
import com.mindigo.discussion_service.dto.response.*;
import com.mindigo.discussion_service.entity.*;
import com.mindigo.discussion_service.exception.DiscussionServiceException;
import com.mindigo.discussion_service.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscussionService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostReactionRepository postReactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final PostReportRepository postReportRepository;
    private final CommentReportRepository commentReportRepository;
    private final UserRestrictionRepository userRestrictionRepository;
    private final RestTemplate restTemplate;

    @Value("${services.file-server.url:http://FILE-SERVER}")
    private String fileServerUrl;

    // Post operations
    @Transactional
    public PostResponse createPost(CreatePostRequest request, List<MultipartFile> images, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String userEmail = getUserEmail(httpRequest);
        String userName = getUserName(httpRequest);
        UserRole userRole = getUserRole(httpRequest);

        // Check if user is restricted from posting
        checkUserRestriction(userId, RestrictionType.POST_BAN);
        checkUserRestriction(userId, RestrictionType.FULL_BAN);

        // Rate limiting check
        checkPostRateLimit(userId);

        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            imageUrls = uploadImages(images);
        }

        Post post = Post.builder()
                .authorId(userId)
                .authorEmail(userEmail)
                .authorName(userName)
                .authorRole(userRole)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .imageUrls(imageUrls)
                .build();

        post = postRepository.save(post);
        return convertToPostResponse(post, userId);
    }

    @Transactional
    public PostResponse updatePost(Long postId, UpdatePostRequest request, List<MultipartFile> newImages, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        if (!post.getAuthorId().equals(userId)) {
            throw new DiscussionServiceException("You can only edit your own posts");
        }

        if (!post.getIsActive()) {
            throw new DiscussionServiceException("Cannot edit inactive post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setCategory(request.getCategory());

        if (newImages != null && !newImages.isEmpty()) {
            List<String> newImageUrls = uploadImages(newImages);
            post.getImageUrls().addAll(newImageUrls);
        }

        post = postRepository.save(post);
        return convertToPostResponse(post, userId);
    }

    public Page<PostResponse> getPosts(PostCategory category, UserRole authorRole, String keyword,
                                       String sortBy, int page, int size, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Sort sort = createSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Post> posts;

        if (keyword != null && !keyword.trim().isEmpty()) {
            if (category != null) {
                posts = postRepository.findByKeywordAndCategoryAndIsActiveTrue(keyword, category, pageable);
            } else {
                posts = postRepository.findByKeywordAndIsActiveTrue(keyword, pageable);
            }
        } else if (category != null && authorRole != null) {
            posts = postRepository.findByIsActiveTrueAndCategoryAndAuthorRoleOrderByCreatedAtDesc(category, authorRole, pageable);
        } else if (category != null) {
            posts = postRepository.findByIsActiveTrueAndCategoryOrderByCreatedAtDesc(category, pageable);
        } else if (authorRole != null) {
            posts = postRepository.findByIsActiveTrueAndAuthorRoleOrderByCreatedAtDesc(authorRole, pageable);
        } else {
            if ("reactions".equals(sortBy)) {
                posts = postRepository.findByIsActiveTrueOrderByReactionCountDesc(pageable);
            } else if ("comments".equals(sortBy)) {
                posts = postRepository.findByIsActiveTrueOrderByCommentCountDesc(pageable);
            } else {
                posts = postRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
            }
        }

        return posts.map(post -> convertToPostResponse(post, userId));
    }

    public PostResponse getPostById(Long postId, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        if (!post.getIsActive()) {
            throw new DiscussionServiceException("Post is not available");
        }

        return convertToPostResponse(post, userId);
    }

    @Transactional
    public void deletePost(Long postId, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        if (!post.getAuthorId().equals(userId)) {
            throw new DiscussionServiceException("You can only delete your own posts");
        }

        post.setIsActive(false);
        postRepository.save(post);
    }

    // Comment operations
    @Transactional
    public CommentResponse createComment(Long postId, CreateCommentRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String userEmail = getUserEmail(httpRequest);
        String userName = getUserName(httpRequest);
        UserRole userRole = getUserRole(httpRequest);

        // Check restrictions
        checkUserRestriction(userId, RestrictionType.COMMENT_BAN);
        checkUserRestriction(userId, RestrictionType.FULL_BAN);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        if (!post.getIsActive()) {
            throw new DiscussionServiceException("Cannot comment on inactive post");
        }

        // Check if parent comment exists (for replies)
        if (request.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new DiscussionServiceException("Parent comment not found"));

            if (!parentComment.getIsActive()) {
                throw new DiscussionServiceException("Cannot reply to inactive comment");
            }
        }

        Comment comment = Comment.builder()
                .postId(postId)
                .authorId(userId)
                .authorEmail(userEmail)
                .authorName(userName)
                .authorRole(userRole)
                .content(request.getContent())
                .parentCommentId(request.getParentCommentId())
                .build();

        comment = commentRepository.save(comment);

        // Update counters
        if (request.getParentCommentId() != null) {
            updateCommentReplyCount(request.getParentCommentId());
        } else {
            updatePostCommentCount(postId);
        }

        return convertToCommentResponse(comment, userId, false);
    }

    public Page<CommentResponse> getComments(Long postId, CommentSortType sortType, int page, int size, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Pageable pageable = PageRequest.of(page, size);

        Page<Comment> comments = switch (sortType) {
            case MOST_REACTIONS ->
                    commentRepository.findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByReactionCountDesc(postId, pageable);
            case MOST_REPLIES ->
                    commentRepository.findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByReplyCountDesc(postId, pageable);
            case OLDEST -> {
                pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
                yield commentRepository.findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByCreatedAtDesc(postId, pageable);
            }
            default ->
                    commentRepository.findByPostIdAndIsActiveTrueAndParentCommentIdIsNullOrderByCreatedAtDesc(postId, pageable);
        };

        return comments.map(comment -> convertToCommentResponse(comment, userId, true));
    }

    public List<CommentResponse> getCommentReplies(Long commentId, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        List<Comment> replies = commentRepository.findByParentCommentIdAndIsActiveTrueOrderByCreatedAtAsc(commentId);
        return replies.stream()
                .map(reply -> convertToCommentResponse(reply, userId, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new DiscussionServiceException("Comment not found"));

        if (!comment.getAuthorId().equals(userId)) {
            throw new DiscussionServiceException("You can only delete your own comments");
        }

        comment.setIsActive(false);
        commentRepository.save(comment);

        // Update counters
        if (comment.getParentCommentId() != null) {
            updateCommentReplyCount(comment.getParentCommentId());
        } else {
            updatePostCommentCount(comment.getPostId());
        }
    }

    // Reaction operations
    @Transactional
    public ReactionSummaryResponse reactToPost(Long postId, ReactToPostRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String userEmail = getUserEmail(httpRequest);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        if (!post.getIsActive()) {
            throw new DiscussionServiceException("Cannot react to inactive post");
        }

        Optional<PostReaction> existingReaction = postReactionRepository.findByPostIdAndUserId(postId, userId);

        if (existingReaction.isPresent()) {
            PostReaction reaction = existingReaction.get();
            if (reaction.getReactionType() == request.getReactionType()) {
                // Remove reaction if same type
                postReactionRepository.delete(reaction);
            } else {
                // Update reaction type
                reaction.setReactionType(request.getReactionType());
                postReactionRepository.save(reaction);
            }
        } else {
            // Create new reaction
            PostReaction reaction = PostReaction.builder()
                    .postId(postId)
                    .userId(userId)
                    .userEmail(userEmail)
                    .reactionType(request.getReactionType())
                    .build();
            postReactionRepository.save(reaction);
        }

        updatePostReactionCount(postId);
        return getPostReactionSummary(postId);
    }

    @Transactional
    public ReactionSummaryResponse reactToComment(Long commentId, ReactToCommentRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String userEmail = getUserEmail(httpRequest);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new DiscussionServiceException("Comment not found"));

        if (!comment.getIsActive()) {
            throw new DiscussionServiceException("Cannot react to inactive comment");
        }

        Optional<CommentReaction> existingReaction = commentReactionRepository.findByCommentIdAndUserId(commentId, userId);

        if (existingReaction.isPresent()) {
            CommentReaction reaction = existingReaction.get();
            if (reaction.getReactionType() == request.getReactionType()) {
                commentReactionRepository.delete(reaction);
            } else {
                reaction.setReactionType(request.getReactionType());
                commentReactionRepository.save(reaction);
            }
        } else {
            CommentReaction reaction = CommentReaction.builder()
                    .commentId(commentId)
                    .userId(userId)
                    .userEmail(userEmail)
                    .reactionType(request.getReactionType())
                    .build();
            commentReactionRepository.save(reaction);
        }

        updateCommentReactionCount(commentId);
        return getCommentReactionSummary(commentId);
    }

    // Report operations
    @Transactional
    public void reportPost(Long postId, ReportPostRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String userEmail = getUserEmail(httpRequest);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        if (!post.getIsActive()) {
            throw new DiscussionServiceException("Cannot report inactive post");
        }

        // Check if user already reported this post
        if (postReportRepository.findByPostIdAndReporterId(postId, userId).isPresent()) {
            throw new DiscussionServiceException("You have already reported this post");
        }

        PostReport report = PostReport.builder()
                .postId(postId)
                .reporterId(userId)
                .reporterEmail(userEmail)
                .reason(request.getReason())
                .description(request.getDescription())
                .build();

        postReportRepository.save(report);

        // Update post report status
        updatePostReportCount(postId);
    }

    @Transactional
    public void reportComment(Long commentId, ReportCommentRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        String userEmail = getUserEmail(httpRequest);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new DiscussionServiceException("Comment not found"));

        if (!comment.getIsActive()) {
            throw new DiscussionServiceException("Cannot report inactive comment");
        }

        if (commentReportRepository.findByCommentIdAndReporterId(commentId, userId).isPresent()) {
            throw new DiscussionServiceException("You have already reported this comment");
        }

        CommentReport report = CommentReport.builder()
                .commentId(commentId)
                .reporterId(userId)
                .reporterEmail(userEmail)
                .reason(request.getReason())
                .description(request.getDescription())
                .build();

        commentReportRepository.save(report);
        updateCommentReportCount(commentId);
    }

    // Admin moderation operations
    @Transactional
    public void moderatePost(Long postId, ModerationRequest request, HttpServletRequest httpRequest) {
        validateAdminRole(httpRequest);
        Long adminId = getUserId(httpRequest);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new DiscussionServiceException("Post not found"));

        post.setIsActive(false);
        post.setModerationReason(request.getReason());
        post.setModeratedBy(adminId);
        post.setModeratedAt(LocalDateTime.now());

        postRepository.save(post);

        // Mark related reports as resolved
        List<PostReport> reports = postReportRepository.findByPostIdOrderByCreatedAtDesc(postId);
        reports.forEach(report -> {
            report.setStatus(ReportStatus.RESOLVED);
            report.setReviewedBy(adminId);
            report.setReviewedAt(LocalDateTime.now());
        });
        postReportRepository.saveAll(reports);
    }

    @Transactional
    public void moderateComment(Long commentId, ModerationRequest request, HttpServletRequest httpRequest) {
        validateAdminRole(httpRequest);
        Long adminId = getUserId(httpRequest);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new DiscussionServiceException("Comment not found"));

        comment.setIsActive(false);
        comment.setModerationReason(request.getReason());
        comment.setModeratedBy(adminId);
        comment.setModeratedAt(LocalDateTime.now());

        commentRepository.save(comment);

        // Update counters
        if (comment.getParentCommentId() != null) {
            updateCommentReplyCount(comment.getParentCommentId());
        } else {
            updatePostCommentCount(comment.getPostId());
        }

        // Mark related reports as resolved
        List<CommentReport> reports = commentReportRepository.findByCommentIdOrderByCreatedAtDesc(commentId);
        reports.forEach(report -> {
            report.setStatus(ReportStatus.RESOLVED);
            report.setReviewedBy(adminId);
            report.setReviewedAt(LocalDateTime.now());
        });
        commentReportRepository.saveAll(reports);
    }

    @Transactional
    public void restrictUser(Long targetUserId, RestrictUserRequest request, HttpServletRequest httpRequest) {
        validateAdminRole(httpRequest);
        Long adminId = getUserId(httpRequest);

        // Get user info from auth service
        String userEmail = getUserEmailById(targetUserId);

        UserRestriction restriction = UserRestriction.builder()
                .userId(targetUserId)
                .userEmail(userEmail)
                .restrictionType(request.getRestrictionType())
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusHours(request.getDurationInHours()))
                .reason(request.getReason())
                .restrictedBy(adminId)
                .build();

        userRestrictionRepository.save(restriction);
    }

    public Page<ReportResponse> getPostReports(int page, int size, HttpServletRequest httpRequest) {
        validateAdminRole(httpRequest);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PostReport> reports = postReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING, pageable);

        return reports.map(this::convertToReportResponse);
    }

    public Page<ReportResponse> getCommentReports(int page, int size, HttpServletRequest httpRequest) {
        validateAdminRole(httpRequest);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CommentReport> reports = commentReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING, pageable);

        return reports.map(this::convertToReportResponse);
    }

    public DiscussionStatsResponse getDiscussionStats(HttpServletRequest httpRequest) {
        validateAdminRole(httpRequest);

        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        return DiscussionStatsResponse.builder()
                .totalPosts(postRepository.count())
                .totalComments(commentRepository.count())
                .totalReactions(postReactionRepository.count() + commentReactionRepository.count())
                .pendingReports(postReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING, PageRequest.of(0, 1)).getTotalElements() +
                        commentReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING, PageRequest.of(0, 1)).getTotalElements())
                .activeRestrictions((long) userRestrictionRepository.findActiveRestrictionsForUser(0L, LocalDateTime.now()).size())
                .postsToday(postRepository.countByAuthorIdAndCreatedAtAfter(0L, today))
                .commentsToday(commentRepository.countByAuthorIdAndCreatedAtAfter(0L, today))
                .build();
    }

    // Helper methods
    private void checkUserRestriction(Long userId, RestrictionType restrictionType) {
        Optional<UserRestriction> restriction = userRestrictionRepository
                .findActiveRestriction(userId, restrictionType, LocalDateTime.now());

        if (restriction.isPresent()) {
            throw new DiscussionServiceException(
                    "You are restricted from this action until " + restriction.get().getEndDate());
        }
    }

    private void checkPostRateLimit(Long userId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        Long recentPosts = postRepository.countByAuthorIdAndCreatedAtAfter(userId, oneHourAgo);

        if (recentPosts >= 10) { // Max 10 posts per hour
            throw new DiscussionServiceException("Rate limit exceeded. Please wait before posting again.");
        }
    }

    private List<String> uploadImages(List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();

        for (MultipartFile image : images) {
            try {
                String uploadUrl = fileServerUrl + "/api/v1/file/upload/images";
                // This is a simplified approach - you might need to create a proper multipart request
                ResponseEntity<ApiResponseClass> response = restTemplate.postForEntity(uploadUrl, image, ApiResponseClass.class);

                if (response.getBody() != null && response.getBody().isSuccess()) {
                    imageUrls.add((String) response.getBody().getData());
                }
            } catch (Exception e) {
                log.error("Failed to upload image", e);
                throw new DiscussionServiceException("Failed to upload image");
            }
        }

        return imageUrls;
    }

    private Sort createSort(String sortBy) {
        switch (sortBy) {
            case "reactions":
                return Sort.by("reactionCount").descending().and(Sort.by("createdAt").descending());
            case "comments":
                return Sort.by("commentCount").descending().and(Sort.by("createdAt").descending());
            case "oldest":
                return Sort.by("createdAt").ascending();
            case "newest":
            default:
                return Sort.by("createdAt").descending();
        }
    }

    private PostResponse convertToPostResponse(Post post, Long currentUserId) {
        Map<String, Integer> reactionBreakdown = getPostReactionBreakdown(post.getId());

        Optional<PostReaction> userReaction = postReactionRepository.findByPostIdAndUserId(post.getId(), currentUserId);

        return PostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .authorRole(post.getAuthorRole())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .imageUrls(post.getImageUrls())
                .reactionCount(post.getReactionCount())
                .commentCount(post.getCommentCount())
                .reactionBreakdown(reactionBreakdown)
                .hasUserReacted(userReaction.isPresent())
                .userReactionType(userReaction.map(r -> r.getReactionType().name()).orElse(null))
                .canEdit(post.getAuthorId().equals(currentUserId))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private CommentResponse convertToCommentResponse(Comment comment, Long currentUserId, boolean includeReplies) {
        Map<String, Integer> reactionBreakdown = getCommentReactionBreakdown(comment.getId());

        Optional<CommentReaction> userReaction = commentReactionRepository.findByCommentIdAndUserId(comment.getId(), currentUserId);

        List<CommentResponse> replies = new ArrayList<>();
        if (includeReplies) {
            List<Comment> replyComments = commentRepository.findByParentCommentIdAndIsActiveTrueOrderByCreatedAtAsc(comment.getId());
            replies = replyComments.stream()
                    .map(reply -> convertToCommentResponse(reply, currentUserId, true))
                    .collect(Collectors.toList());
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .authorId(comment.getAuthorId())
                .authorName(comment.getAuthorName())
                .authorRole(comment.getAuthorRole())
                .content(comment.getContent())
                .parentCommentId(comment.getParentCommentId())
                .reactionCount(comment.getReactionCount())
                .replyCount(comment.getReplyCount())
                .reactionBreakdown(reactionBreakdown)
                .hasUserReacted(userReaction.isPresent())
                .userReactionType(userReaction.map(r -> r.getReactionType().name()).orElse(null))
                .canEdit(comment.getAuthorId().equals(currentUserId))
                .replies(replies)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private ReportResponse convertToReportResponse(PostReport report) {
        return ReportResponse.builder()
                .id(report.getId())
                .postId(report.getPostId())
                .reporterEmail(report.getReporterEmail())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .reviewedAt(report.getReviewedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }

    private ReportResponse convertToReportResponse(CommentReport report) {
        return ReportResponse.builder()
                .id(report.getId())
                .commentId(report.getCommentId())
                .reporterEmail(report.getReporterEmail())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .reviewedAt(report.getReviewedAt())
                .createdAt(report.getCreatedAt())
                .build();
    }

    private Map<String, Integer> getPostReactionBreakdown(Long postId) {
        List<Object[]> results = postReactionRepository.countReactionsByPostId(postId);
        Map<String, Integer> breakdown = new HashMap<>();

        for (Object[] result : results) {
            ReactionType type = (ReactionType) result[0];
            Long count = (Long) result[1];
            breakdown.put(type.name(), count.intValue());
        }

        return breakdown;
    }

    private Map<String, Integer> getCommentReactionBreakdown(Long commentId) {
        List<Object[]> results = commentReactionRepository.countReactionsByCommentId(commentId);
        Map<String, Integer> breakdown = new HashMap<>();

        for (Object[] result : results) {
            ReactionType type = (ReactionType) result[0];
            Long count = (Long) result[1];
            breakdown.put(type.name(), count.intValue());
        }

        return breakdown;
    }

    private ReactionSummaryResponse getPostReactionSummary(Long postId) {
        Map<String, Integer> breakdown = getPostReactionBreakdown(postId);
        Integer total = breakdown.values().stream().mapToInt(Integer::intValue).sum();

        return ReactionSummaryResponse.builder()
                .totalReactions(total)
                .reactionBreakdown(breakdown)
                .build();
    }

    private ReactionSummaryResponse getCommentReactionSummary(Long commentId) {
        Map<String, Integer> breakdown = getCommentReactionBreakdown(commentId);
        Integer total = breakdown.values().stream().mapToInt(Integer::intValue).sum();

        return ReactionSummaryResponse.builder()
                .totalReactions(total)
                .reactionBreakdown(breakdown)
                .build();
    }

    private void updatePostReactionCount(Long postId) {
        Long count = postReactionRepository.countByPostId(postId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setReactionCount(count.intValue());
            postRepository.save(post);
        }
    }

    private void updateCommentReactionCount(Long commentId) {
        Long count = commentReactionRepository.countByCommentId(commentId);
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment != null) {
            comment.setReactionCount(count.intValue());
            commentRepository.save(comment);
        }
    }

    private void updatePostCommentCount(Long postId) {
        Long count = commentRepository.countByPostIdAndIsActiveTrue(postId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setCommentCount(count.intValue());
            postRepository.save(post);
        }
    }

    private void updateCommentReplyCount(Long commentId) {
        Long count = commentRepository.countByParentCommentIdAndIsActiveTrue(commentId);
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment != null) {
            comment.setReplyCount(count.intValue());
            commentRepository.save(comment);
        }
    }

    private void updatePostReportCount(Long postId) {
        Long count = postReportRepository.countByPostId(postId);
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            post.setReportCount(count.intValue());
            post.setIsReported(count > 0);
            postRepository.save(post);
        }
    }

    private void updateCommentReportCount(Long commentId) {
        Long count = commentReportRepository.countByCommentId(commentId);
        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment != null) {
            comment.setReportCount(count.intValue());
            comment.setIsReported(count > 0);
            commentRepository.save(comment);
        }
    }

    private String getUserEmailById(Long userId) {
        try {
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/profilebyid/" + userId;
            ResponseEntity<ApiResponseClass> response = restTemplate.getForEntity(authServiceUrl, ApiResponseClass.class);

            if (response.getBody() != null && response.getBody().isSuccess()) {
                Map<String, Object> userData = (Map<String, Object>) response.getBody().getData();
                return (String) userData.get("email");
            }

            return "unknown@example.com";
        } catch (Exception e) {
            log.error("Failed to get user email for ID: " + userId, e);
            return "unknown@example.com";
        }
    }

    // Utility methods for extracting headers
    private Long getUserId(HttpServletRequest request) {
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null) {
            throw new DiscussionServiceException("User ID not found in request");
        }
        return Long.parseLong(userIdHeader);
    }

    private String getUserEmail(HttpServletRequest request) {
        String email = request.getHeader("X-User-Email");
        if (email == null) {
            throw new DiscussionServiceException("User email not found in request");
        }
        return email;
    }

    private String getUserName(HttpServletRequest request) {
        // Assuming you have user name in headers, otherwise get from auth service
        String name = request.getHeader("X-User-Name");
        if (name == null) {
            // Fallback to getting from auth service
            Long userId = getUserId(request);
            return getUserNameById(userId);
        }
        return name;
    }

    private UserRole getUserRole(HttpServletRequest request) {
        String roleHeader = request.getHeader("X-User-Role");
        if (roleHeader == null) {
            throw new DiscussionServiceException("User role not found in request");
        }
        if(roleHeader.equalsIgnoreCase("ADMIN"))
            roleHeader="ADMIN";
        return UserRole.valueOf(roleHeader.toUpperCase());
    }

    private String getUserNameById(Long userId) {
        try {
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/profilebyid/" + userId;
            ResponseEntity<ApiResponseClass> response = restTemplate.getForEntity(authServiceUrl, ApiResponseClass.class);

            if (response.getBody() != null && response.getBody().isSuccess()) {
                Map<String, Object> userData = (Map<String, Object>) response.getBody().getData();
                return (String) userData.get("name");
            }

            return "Unknown User";
        } catch (Exception e) {
            log.error("Failed to get user name for ID: " + userId, e);
            return "Unknown User";
        }
    }

    private void validateAdminRole(HttpServletRequest request) {
        UserRole role = getUserRole(request);
        if (role != UserRole.ADMIN) {
            throw new DiscussionServiceException("Admin access required");
        }
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, UpdateCommentRequest request, HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new DiscussionServiceException("Comment not found"));

        if (!comment.getAuthorId().equals(userId)) {
            throw new DiscussionServiceException("You can only edit your own comments");
        }

        if (!comment.getIsActive()) {
            throw new DiscussionServiceException("Cannot edit inactive comment");
        }

        comment.setContent(request.getContent());

        comment = commentRepository.save(comment);
        return convertToCommentResponse(comment, userId, true);
    }
}