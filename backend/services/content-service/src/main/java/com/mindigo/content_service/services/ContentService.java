package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.*;
import com.mindigo.content_service.exceptions.ContentServiceException;
import com.mindigo.content_service.exceptions.ResourceNotFoundException;
import com.mindigo.content_service.exceptions.UnauthorizedException;
import com.mindigo.content_service.models.*;
import com.mindigo.content_service.repositories.CourseRepository;
import com.mindigo.content_service.repositories.FeedbackRepository;
import com.mindigo.content_service.repositories.PackageRepository;
import com.mindigo.content_service.repositories.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.Package;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContentService {

//    private final CourseRepository courseRepository;
//    private final PackageRepository packageRepository;
//    private final SubscriptionRepository subscriptionRepository;
//    private final FeedbackRepository feedbackRepository;
//
//    @Transactional
//    public CourseResponseDto addCourse(String role, Long userId, CourseRequestDto request) {
//        if (!List.of("EXPERT", "ADMIN").contains(role)) {
//            throw new UnauthorizedException("Only EXPERT or ADMIN can create courses");
//        }
//
//        Package packageEntity = packageRepository.findById(request.getPackageId())
//                .orElseThrow(() -> new ResourceNotFoundException("Package not found with ID: " + request.getPackageId()));
//
//        Course course = Course.builder()
//                .title(request.getTitle())
//                .description(request.getDescription())
//                .expertId(userId)
//                .isCustom(request.isCustom())
//                .targetUserId(request.getTargetUserId())
//                .packageEntity(packageEntity)
//                .durationDays(request.getDurationDays())
//                .build();
//
//        Course savedCourse = courseRepository.save(course);
//
//        // Handle feedback questions if provided
//        if (request.getFeedbackQuestions() != null && !request.getFeedbackQuestions().isEmpty()) {
//            for (FeedbackQuestionDto feedbackDto : request.getFeedbackQuestions()) {
//                Feedback feedback = Feedback.builder()
//                        .userId(null) // Template feedback, no user yet
//                        .course(savedCourse)
//                        .questionType(feedbackDto.getQuestionType())
//                        .question(feedbackDto.getQuestion())
//                        .options(feedbackDto.getOptions())
//                        .expertDesigned(feedbackDto.isExpertDesigned())
//                        .submittedAt(LocalDateTime.now())
//                        .build();
//                feedbackRepository.save(feedback);
//            }
//        }
//
//        return CourseResponseDto.builder()
//                .id(savedCourse.getId())
//                .title(savedCourse.getTitle())
//                .description(savedCourse.getDescription())
//                .expertId(savedCourse.getExpertId())
//                .isCustom(savedCourse.isCustom())
//                .targetUserId(savedCourse.getTargetUserId())
//                .packageId(savedCourse.getPackageEntity().getId())
//                .durationDays(savedCourse.getDurationDays())
//                .build();
//    }
//
//    @Transactional
//    public void removeCourse(String role, Long userId, Long courseId) {
//        if (!List.of("EXPERT", "ADMIN").contains(role)) {
//            throw new UnauthorizedException("Only EXPERT or ADMIN can delete courses");
//        }
//
//        Course course = courseRepository.findById(courseId)
//                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
//
//        if (role.equals("EXPERT") && !Objects.equals(course.getExpertId(), userId)) {
//            throw new UnauthorizedException("EXPERT can only delete their own courses");
//        }
//
//        courseRepository.delete(course);
//    }
//
//    @Transactional
//    public SubscriptionResponseDto subscribe(Long userId, SubscriptionRequestDto request) {
//        Package packageEntity = packageRepository.findById(request.getPackageId())
//                .orElseThrow(() -> new ResourceNotFoundException("Package not found with ID: " + request.getPackageId()));
//
//        Subscription subscription = Subscription.builder()
//                .userId(userId)
//                .packageEntity(packageEntity)
//                .startDate(LocalDate.now())
//                .endDate(LocalDate.now().plusDays(packageEntity.getDurationDays()))
//                .isActive(true)
//                .build();
//
//        Subscription savedSubscription = subscriptionRepository.save(subscription);
//
//        return SubscriptionResponseDto.builder()
//                .id(savedSubscription.getId())
//                .userId(savedSubscription.getUserId())
//                .packageId(savedSubscription.getPackageEntity().getId())
//                .startDate(savedSubscription.getStartDate())
//                .endDate(savedSubscription.getEndDate())
//                .isActive(savedSubscription.isActive())
//                .build();
//    }
//
//    @Transactional
//    public void unsubscribe(Long userId, Long subscriptionId) {
//        Subscription subscription = subscriptionRepository.findById(subscriptionId)
//                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with ID: " + subscriptionId));
//
//        if (!Objects.equals(subscription.getUserId(), userId)) {
//            throw new UnauthorizedException("User can only unsubscribe from their own subscription");
//        }
//
//        subscription.setActive(false);
//        subscriptionRepository.save(subscription);
//    }
}