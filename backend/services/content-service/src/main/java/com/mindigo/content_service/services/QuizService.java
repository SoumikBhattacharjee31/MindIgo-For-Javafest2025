package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.quiz.*;
import com.mindigo.content_service.exceptions.InvalidRequestException;
import com.mindigo.content_service.exceptions.quiz.QuizNotFound;
import com.mindigo.content_service.models.quiz.*;
import com.mindigo.content_service.repositories.quiz.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class QuizService {
    private final Logger logger = LoggerFactory.getLogger(QuizService.class);
    private final QuizRepository quizRepository;
    private final UserQuizSessionRepository sessionRepository;
    private final UserQuizAnswerRepository answerRepository;


    public QuizGenerationResponse generateQuiz(QuizGenerationRequest request) {
        logger.info("Generating quiz for file_id: {}", request.getFile_id());

        String generatedQuizCode = generateUniqueQuizCode();

        List<Quiz> quizzes = new ArrayList<>();
        int sequenceNumber = 1;

        for (QuizGenerationRequest.QuizQuestion quizQuestion : request.getQuizzes()) {
            QuizType type = mapStringToQuizType(quizQuestion.getType());

            Quiz quiz = Quiz.builder()
                    .fileId(request.getFile_id())
                    .quizCode(generatedQuizCode)
                    .question(quizQuestion.getQuestion())
                    .sequenceNumber(sequenceNumber++)
                    .type(type)
                    .options(quizQuestion.getOptions())
                    .scaleMin(quizQuestion.getScale_min())
                    .scaleMax(quizQuestion.getScale_max())
                    .scaleLabels(quizQuestion.getScale_labels())
                    .build();

            quizzes.add(quiz);
        }

        quizRepository.saveAll(quizzes);

        logger.info("Successfully generated {} questions for file_id: {} with quiz code: {}",
                quizzes.size(), request.getFile_id(), generatedQuizCode);

        return QuizGenerationResponse.builder()
                .file_id(request.getFile_id())
                .quizCode(generatedQuizCode)
                .totalQuestions(quizzes.size())
                .build();
    }

    private String generateUniqueQuizCode() {
        String prefix = "QUIZ_";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomSuffix = String.valueOf((int)(Math.random() * 1000));
        return prefix + timestamp + "_" + randomSuffix;
    }

    private QuizType mapStringToQuizType(String type) {
        return switch (type.toLowerCase()) {
            case "scale" -> QuizType.SCALE;
            case "mcq" -> QuizType.MCQ;
            case "descriptive" -> QuizType.DESCRIPTIVE;
            default -> throw new IllegalArgumentException("Unknown quiz type: " + type);
        };
    }

    public QuizSessionResponse startQuiz(QuizStartRequest request, String userId) {
        logger.info("Starting quiz for user: {} with quiz_code: {}", userId, request.getQuizCode());

        Optional<Quiz> firstQuizOpt = quizRepository.findFirstByQuizCodeOrderBySequenceNumberAsc(request.getQuizCode());
        if (firstQuizOpt.isEmpty()) {
            throw new QuizNotFound("Quiz not found for quiz_code: " + request.getQuizCode());
        }
        Quiz firstQuiz = firstQuizOpt.get();
        String quizCode = firstQuiz.getQuizCode();

        Integer totalQuestions = quizRepository.countByQuizCode(quizCode);
        if (totalQuestions == 0) {
            throw new RuntimeException("Quiz not found for quiz_code: " + request.getQuizCode());
        }

        Optional<UserQuizSession> existingSession = sessionRepository
                .findByUserIdAndQuizCodeAndStatus(userId, quizCode, SessionStatus.IN_PROGRESS);

        UserQuizSession session;
        Quiz currentQuestion = null;
        String message;

        if (existingSession.isPresent()) {
            session = existingSession.get();
            logger.info("Resuming existing session: {}", session.getId());
            currentQuestion = getCurrentQuestion(quizCode, session.getCurrentQuestionSequence());
            message = "Quiz resumed successfully";
        } else {
            List<UserQuizSession> pastSessions = sessionRepository.findByUserIdAndQuizCodeOrderByStartedAtDesc(userId, quizCode);
            if (!pastSessions.isEmpty() && pastSessions.getFirst().getStatus() == SessionStatus.COMPLETED) {
                session = pastSessions.getFirst();
                message = "Quiz already completed";
            } else {
                session = UserQuizSession.builder()
                        .userId(userId)
                        .quizCode(quizCode)
                        .currentQuestionSequence(1)
                        .totalQuestions(totalQuestions)
                        .status(SessionStatus.IN_PROGRESS)
                        .startedAt(LocalDateTime.now())
                        .build();
                session = sessionRepository.save(session);
                logger.info("Created new session: {}", session.getId());
                currentQuestion = getCurrentQuestion(quizCode, session.getCurrentQuestionSequence());
                message = "Quiz started successfully";
            }
        }

        return QuizSessionResponse.builder()
                .sessionId(session.getId())
                .quizCode(session.getQuizCode())
                .currentQuestionSequence(session.getCurrentQuestionSequence())
                .totalQuestions(session.getTotalQuestions())
                .progressPercentage(session.getProgressPercentage())
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .currentQuestion(currentQuestion)
                .message(message)
                .build();
    }

    public QuizSessionResponse submitAnswer(QuizAnswerRequest request, String userId) {
        logger.info("Submitting answer for session: {} by user: {}", request.getSessionId(), userId);

        UserQuizSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + request.getSessionId()));

        if (!session.getUserId().equals(userId)) {
            throw new InvalidRequestException("Unauthorized access to session");
        }

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new RuntimeException("Quiz session is already completed");
        }

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + request.getQuizId()));

        if (!quiz.getSequenceNumber().equals(session.getCurrentQuestionSequence())) {
            throw new RuntimeException("Submitted answer does not match the current question sequence");
        }

        Optional<UserQuizAnswer> existingAnswer = answerRepository
                .findBySessionIdAndQuizId(request.getSessionId(), request.getQuizId());

        UserQuizAnswer answer;
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.setAnswer(request.getAnswer());
            answer.setAnsweredAt(LocalDateTime.now());
        } else {
            answer = UserQuizAnswer.builder()
                    .userId(session.getUserId())
                    .quiz(quiz)
                    .session(session)
                    .answer(request.getAnswer())
                    .build();
        }

        answerRepository.save(answer);

        if (session.getCurrentQuestionSequence() < session.getTotalQuestions()) {
            session.setCurrentQuestionSequence(session.getCurrentQuestionSequence() + 1);
            sessionRepository.save(session);
            Quiz nextQuestion = getCurrentQuestion(session.getQuizCode(), session.getCurrentQuestionSequence());
            return QuizSessionResponse.builder()
                    .sessionId(session.getId())
                    .quizCode(session.getQuizCode())
                    .currentQuestionSequence(session.getCurrentQuestionSequence())
                    .totalQuestions(session.getTotalQuestions())
                    .progressPercentage(session.getProgressPercentage())
                    .status(session.getStatus())
                    .startedAt(session.getStartedAt())
                    .completedAt(session.getCompletedAt())
                    .currentQuestion(nextQuestion)
                    .message("Answer submitted successfully")
                    .build();
        } else {
            session.setCurrentQuestionSequence(session.getCurrentQuestionSequence() + 1);
            session.setStatus(SessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);
            return QuizSessionResponse.builder()
                    .sessionId(session.getId())
                    .quizCode(session.getQuizCode())
                    .currentQuestionSequence(session.getCurrentQuestionSequence())
                    .totalQuestions(session.getTotalQuestions())
                    .progressPercentage(100.0)
                    .status(session.getStatus())
                    .startedAt(session.getStartedAt())
                    .completedAt(session.getCompletedAt())
                    .currentQuestion(null)
                    .message("Quiz completed successfully!")
                    .build();
        }
    }

    public QuizSessionResponse getSessionStatus(Long sessionId, String userId) {
        UserQuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new InvalidRequestException("Unauthorized access to session");
        }

        Quiz currentQuestion = null;
        if (session.getStatus() == SessionStatus.IN_PROGRESS) {
            currentQuestion = getCurrentQuestion(session.getQuizCode(), session.getCurrentQuestionSequence());
        }

        return QuizSessionResponse.builder()
                .sessionId(session.getId())
                .quizCode(session.getQuizCode())
                .currentQuestionSequence(session.getCurrentQuestionSequence())
                .totalQuestions(session.getTotalQuestions())
                .progressPercentage(session.getProgressPercentage())
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .currentQuestion(currentQuestion)
                .build();
    }

    public List<UserQuizSession> getUserSessions(String userId) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(userId);
    }

    public List<UserQuizAnswer> getSessionAnswers(Long sessionId, String userId) {
        UserQuizSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        if (!session.getUserId().equals(userId)) {
            throw new InvalidRequestException("Unauthorized access to session");
        }

        return answerRepository.findBySessionIdOrderByQuiz_SequenceNumberAsc(sessionId);
    }

    public List<String> getAvailableQuizCodes(String userId) {
        List<String> allQuizCodes = quizRepository.findDistinctQuizCodes();

        List<UserQuizSession> userSessions = sessionRepository.findByUserIdOrderByStartedAtDesc(userId);
        Set<String> userQuizCodes = userSessions.stream()
                .map(UserQuizSession::getQuizCode)
                .collect(Collectors.toSet());

        List<String> available = new ArrayList<>();
        for (String code : allQuizCodes) {
            if (!userQuizCodes.contains(code)) {
                available.add(code);
            }
        }

        return available;
    }

    private Quiz getCurrentQuestion(String quizCode, Integer sequenceNumber) {
        return quizRepository.findByQuizCodeAndSequenceNumber(quizCode, sequenceNumber)
                .orElseThrow(() -> new RuntimeException(
                        String.format("Question not found for quiz code: %s, sequence: %d", quizCode, sequenceNumber)
                ));
    }
}