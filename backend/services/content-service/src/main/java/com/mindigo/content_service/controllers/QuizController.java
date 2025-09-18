package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.quiz.*;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.models.quiz.UserQuizAnswer;
import com.mindigo.content_service.models.quiz.UserQuizSession;
import com.mindigo.content_service.services.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/content/quiz")
@RequiredArgsConstructor
public class QuizController {
    private static final Logger logger = LoggerFactory.getLogger(QuizController.class);

    private final QuizService quizService;

    private static final String USER_ROLE = "USER";
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String ADMIN_ROLE_2 = "ADMINISTRATOR";

    private void validateUserRole(String role) {
        if (!USER_ROLE.equalsIgnoreCase(role)) {
            log.warn("Unauthorized access attempt with role: {} (USER required)", role);
            throw new InvalidRequestException("Access denied: USER role required");
        }
    }

    private void validateAdminRole(String role) {
        if (!ADMIN_ROLE.equalsIgnoreCase(role) && !ADMIN_ROLE_2.equalsIgnoreCase(role)) {
            log.warn("Unauthorized access attempt with role: {} (ADMIN required)", role);
            throw new InvalidRequestException("Access denied: ADMIN role required");
        }
    }

    private <T> ResponseEntity<ApiResponseClass<T>> executeWithUserAuth(
            String userId, String role, UserServiceOperation<T> operation, String successMessage) {

        validateUserRole(role);
        T result = operation.execute(userId);

        return ResponseEntity.ok(ApiResponseClass.success(result, successMessage));
    }

    private <T> ResponseEntity<ApiResponseClass<T>> executeWithAdminAuth(
            String userId, String role, AdminServiceOperation<T> operation) {

        validateAdminRole(role);
        T result = operation.execute();

        return ResponseEntity.ok(ApiResponseClass.success(result, "Quiz generated successfully"));
    }

    @FunctionalInterface
    private interface UserServiceOperation<T> {
        T execute(String userId);
    }

    @FunctionalInterface
    private interface AdminServiceOperation<T> {
        T execute();
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponseClass<QuizGenerationResponse>> generateQuiz(
            @Valid @RequestBody QuizGenerationRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        return executeWithAdminAuth(
                userId,
                userRole,
                () -> quizService.generateQuiz(request)
        );
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponseClass<QuizSessionResponse>> startQuiz(
            @Valid @RequestBody QuizStartRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        return executeWithUserAuth(
                userId,
                userRole,
                id -> quizService.startQuiz(request, id),
                "Quiz started successfully"
        );
    }

    @PostMapping("/answer")
    public ResponseEntity<ApiResponseClass<QuizSessionResponse>> submitAnswer(
            @Valid @RequestBody QuizAnswerRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        validateUserRole(userRole);
        QuizSessionResponse result = quizService.submitAnswer(request, userId);
        return ResponseEntity.ok(ApiResponseClass.success(result, "Answer submitted successfully"));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponseClass<QuizSessionResponse>> getSessionStatus(
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        validateUserRole(userRole);
        QuizSessionResponse result = quizService.getSessionStatus(sessionId, userId);
        return ResponseEntity.ok(ApiResponseClass.success(result, "Session status retrieved successfully"));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponseClass<List<UserQuizSession>>> getUserSessions(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        return executeWithUserAuth(
                userId,
                userRole,
                quizService::getUserSessions,
                "User sessions retrieved successfully"
        );
    }

    @GetMapping("/session/{sessionId}/answers")
    public ResponseEntity<ApiResponseClass<List<UserQuizAnswer>>> getSessionAnswers(
            @PathVariable Long sessionId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        validateUserRole(userRole);
        List<UserQuizAnswer> result = quizService.getSessionAnswers(sessionId, userId);
        return ResponseEntity.ok(ApiResponseClass.success(result, "Session answers retrieved successfully"));
    }

    @GetMapping("/available-quizzes")
    public ResponseEntity<ApiResponseClass<List<String>>> getAvailableQuizzes(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String userRole) {

        return executeWithUserAuth(
                userId,
                userRole,
                quizService::getAvailableQuizCodes,
                "Available quizzes retrieved successfully"
        );
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponseClass<Void>> handleInvalidRequest(InvalidRequestException e) {
        log.error("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponseClass.error(e.getMessage(), "400"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseClass<Void>> handleGenericException(Exception e) {
        log.error("Unexpected error in quiz controller", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseClass.error("An unexpected error occurred", "500"));
    }
}