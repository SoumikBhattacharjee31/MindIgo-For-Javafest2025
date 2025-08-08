package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.CourseRequest;
import com.mindigo.content_service.dto.PagedCourseResponse;
import com.mindigo.content_service.dto.CourseResponse;
import com.mindigo.content_service.exceptions.CourseCreationException;
import com.mindigo.content_service.exceptions.PackageNotFoundException;
import com.mindigo.content_service.models.Course;
import com.mindigo.content_service.models.Package;
import com.mindigo.content_service.repositories.CourseRepository;
import com.mindigo.content_service.repositories.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final PackageRepository packageRepository;

    @Transactional
    public CourseResponse addCourse(Long userId, CourseRequest courseRequest) {
        if (courseRequest.getCustom() != null && courseRequest.getCustom()) {
            throw new CourseCreationException("Custom courses must be created using the /add/custom endpoint");
        }
        validateCourseRequest(courseRequest);

        if (courseRepository.existsByTitleAndPackageEntityId(courseRequest.getTitle(), courseRequest.getPackageId())) {
            throw new CourseCreationException("A course with the title '" + courseRequest.getTitle() + "' already exists in this package");
        }

        Package packageEntity = packageRepository.findById(courseRequest.getPackageId())
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + courseRequest.getPackageId() + " not found"));

        Course newCourse = Course.builder()
                .title(courseRequest.getTitle())
                .description(courseRequest.getDescription())
                .ownerId(userId)
                .custom(false)
                .active(false)
                .targetUserId(null)
                .packageEntity(packageEntity)
                .durationDays(courseRequest.getDurationDays())
                .build();

        Course savedCourse = courseRepository.save(newCourse);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .ownerId(savedCourse.getOwnerId())
                .custom(savedCourse.getCustom())
                .active(savedCourse.getActive())
                .targetUserId(savedCourse.getTargetUserId())
                .packageId(savedCourse.getPackageEntity().getId())
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    @Transactional
    public CourseResponse addCustomCourse(Long userId, CourseRequest courseRequest) {
        if (courseRequest.getCustom() == null || !courseRequest.getCustom()) {
            throw new CourseCreationException("Custom course creation requires custom() to be true");
        }
        validateCourseRequest(courseRequest);

        if (courseRepository.existsByTitleAndPackageEntityId(courseRequest.getTitle(), courseRequest.getPackageId())) {
            throw new CourseCreationException("A course with the title '" + courseRequest.getTitle() + "' already exists in this package");
        }

        Package packageEntity = packageRepository.findById(courseRequest.getPackageId())
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + courseRequest.getPackageId() + " not found"));

        Long targetUserId = resolveUserIdFromEmail(courseRequest.getTargetUserEmail());
        if (targetUserId == null) {
            throw new CourseCreationException("Could not resolve target user ID from email: " + courseRequest.getTargetUserEmail());
        }

        Course newCourse = Course.builder()
                .title(courseRequest.getTitle())
                .description(courseRequest.getDescription())
                .ownerId(userId)
                .custom(true)
                .active(false)
                .targetUserId(targetUserId)
                .packageEntity(packageEntity)
                .durationDays(courseRequest.getDurationDays())
                .build();

        Course savedCourse = courseRepository.save(newCourse);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .ownerId(savedCourse.getOwnerId())
                .custom(savedCourse.getCustom())
                .active(savedCourse.getActive())
                .targetUserId(savedCourse.getTargetUserId())
                .packageId(savedCourse.getPackageEntity().getId())
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    private void validateCourseRequest(CourseRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new CourseCreationException("Course title cannot be empty");
        }
        if (request.getDurationDays() == null || request.getDurationDays() < 1) {
            throw new CourseCreationException("Duration must be at least 1 day");
        }
        if (request.getPackageId() == null) {
            throw new CourseCreationException("Package ID is mandatory");
        }
        if (request.getCustom() != null && request.getCustom() && (request.getTargetUserEmail() == null || request.getTargetUserEmail().trim().isEmpty())) {
            throw new CourseCreationException("Custom courses must specify a target user email");
        }
        if (request.getCustom() == null || !request.getCustom()) {
            if (request.getTargetUserEmail() != null) {
                throw new CourseCreationException("Non-custom courses cannot have a target user email");
            }
        }
    }

    @Transactional
    public void removeCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        if (!course.getOwnerId().equals(userId)) {
            throw new CourseCreationException("User not authorized to remove this course");
        }

        courseRepository.delete(course);
    }

    @Transactional
    public CourseResponse activateCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        if (!course.getOwnerId().equals(userId)) {
            throw new CourseCreationException("User not authorized to activate this course");
        }

        if (course.getDays().isEmpty()) {
            throw new CourseCreationException("Cannot activate course: No course days found");
        }

        course.setActive(true);
        Course savedCourse = courseRepository.save(course);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .ownerId(savedCourse.getOwnerId())
                .custom(savedCourse.getCustom())
                .active(savedCourse.getActive())
                .targetUserId(savedCourse.getTargetUserId())
                .packageId(savedCourse.getPackageEntity().getId())
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedCourseResponse listCoursesByUserId(Long userId, int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> courses = courseRepository.findByOwnerId(userId, pageable);

        List<CourseResponse> courseContent = courses.getContent().stream()
                .map(course -> CourseResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .ownerId(course.getOwnerId())
                        .custom(course.getCustom())
                        .active(course.getActive())
                        .targetUserId(course.getTargetUserId())
                        .packageId(course.getPackageEntity().getId())
                        .durationDays(course.getDurationDays())
                        .canEdit(course.getOwnerId().equals(userId))
                        .build())
                .toList();

        return PagedCourseResponse.builder()
                .courses(courseContent)
                .size(courses.getSize())
                .page(courses.getNumber())
                .totalElements(courses.getTotalElements())
                .totalPages(courses.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedCourseResponse listCoursesByEmail(String email, int page, int size) {
        // TODO: Replace with actual auth-service call to resolve userId from email
        Long userId = resolveUserIdFromEmail(email);
        return listCoursesByUserId(userId, page, size);
    }

    @Transactional(readOnly = true)
    public PagedCourseResponse listActiveCourses(int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> courses = courseRepository.findByActiveTrue(pageable);

        List<CourseResponse> courseContent = courses.getContent().stream()
                .map(course -> CourseResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .ownerId(course.getOwnerId())
                        .custom(course.getCustom())
                        .active(course.getActive())
                        .targetUserId(course.getTargetUserId())
                        .packageId(course.getPackageEntity().getId())
                        .durationDays(course.getDurationDays())
                        .canEdit(false) // No userId provided, so canEdit is false
                        .build())
                .toList();

        return PagedCourseResponse.builder()
                .courses(courseContent)
                .size(courses.getSize())
                .page(courses.getNumber())
                .totalElements(courses.getTotalElements())
                .totalPages(courses.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseDetails(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .ownerId(course.getOwnerId())
                .custom(course.getCustom())
                .active(course.getActive())
                .targetUserId(course.getTargetUserId())
                .packageId(course.getPackageEntity().getId())
                .durationDays(course.getDurationDays())
                .canEdit(userId.equals(course.getOwnerId()))
                .build();
    }

    @Transactional
    public CourseResponse replaceCourse(Long userId, Long courseId, CourseRequest courseRequest) {
        validateCourseRequest(courseRequest);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        if (!course.getOwnerId().equals(userId)) {
            throw new CourseCreationException("User not authorized to replace this course");
        }

        Package packageEntity = packageRepository.findById(courseRequest.getPackageId())
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + courseRequest.getPackageId() + " not found"));

        if (!course.getTitle().equals(courseRequest.getTitle()) &&
                courseRepository.existsByTitleAndPackageEntityId(courseRequest.getTitle(), courseRequest.getPackageId())) {
            throw new CourseCreationException("A course with the title '" + courseRequest.getTitle() + "' already exists in this package");
        }

        Long targetUserId = courseRequest.getCustom() != null && courseRequest.getCustom() && courseRequest.getTargetUserEmail() != null
                ? resolveUserIdFromEmail(courseRequest.getTargetUserEmail())
                : null;

        if (courseRequest.getCustom() != null && courseRequest.getCustom() && targetUserId == null) {
            throw new CourseCreationException("Could not resolve target user ID from email: " + courseRequest.getTargetUserEmail());
        }

        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setCustom(courseRequest.getCustom() != null ? courseRequest.getCustom() : false);
        course.setTargetUserId(targetUserId);
        course.setPackageEntity(packageEntity);
        course.setDurationDays(courseRequest.getDurationDays());

        Course savedCourse = courseRepository.save(course);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .ownerId(savedCourse.getOwnerId())
                .custom(savedCourse.getCustom())
                .active(savedCourse.getActive())
                .targetUserId(savedCourse.getTargetUserId())
                .packageId(savedCourse.getPackageEntity().getId())
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    @Transactional
    public CourseResponse updateCourse(Long userId, Long courseId, CourseRequest courseRequest) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        if (!course.getOwnerId().equals(userId)) {
            throw new CourseCreationException("User not authorized to update this course");
        }

        boolean needsValidation = false;

        if (courseRequest.getTitle() != null && !courseRequest.getTitle().trim().isEmpty()) {
            if (!course.getTitle().equals(courseRequest.getTitle()) &&
                    courseRepository.existsByTitleAndPackageEntityId(courseRequest.getTitle(), course.getPackageEntity().getId())) {
                throw new CourseCreationException("A course with the title '" + courseRequest.getTitle() + "' already exists in this package");
            }
            course.setTitle(courseRequest.getTitle());
            needsValidation = true;
        }
        if (courseRequest.getDescription() != null) {
            course.setDescription(courseRequest.getDescription());
        }
        if (courseRequest.getCustom() != null) {
            course.setCustom(courseRequest.getCustom());
            needsValidation = true;
        }
        if (courseRequest.getTargetUserEmail() != null) {
            Long targetUserId = resolveUserIdFromEmail(courseRequest.getTargetUserEmail());
            if (targetUserId == null) {
                throw new CourseCreationException("Could not resolve target user ID from email: " + courseRequest.getTargetUserEmail());
            }
            course.setTargetUserId(targetUserId);
            needsValidation = true;
        }
        if (courseRequest.getPackageId() != null) {
            Package packageEntity = packageRepository.findById(courseRequest.getPackageId())
                    .orElseThrow(() -> new PackageNotFoundException("Package with ID " + courseRequest.getPackageId() + " not found"));
            course.setPackageEntity(packageEntity);
            needsValidation = true;
        }
        if (courseRequest.getDurationDays() != null) {
            if (courseRequest.getDurationDays() < 1) {
                throw new CourseCreationException("Duration must be at least 1 day");
            }
            course.setDurationDays(courseRequest.getDurationDays());
        }

        if (needsValidation) {
            if (course.getCustom() && course.getTargetUserId() == null) {
                throw new CourseCreationException("Custom courses must specify a target user ID");
            }
            if (!course.getCustom() && course.getTargetUserId() != null) {
                throw new CourseCreationException("Non-custom courses cannot have a target user ID");
            }
        }

        Course savedCourse = courseRepository.save(course);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .ownerId(savedCourse.getOwnerId())
                .custom(savedCourse.getCustom())
                .active(savedCourse.getActive())
                .targetUserId(savedCourse.getTargetUserId())
                .packageId(savedCourse.getPackageEntity().getId())
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    private Long resolveUserIdFromEmail(String email) {
        // TODO: Implement actual auth-service call to resolve userId from email
        // Dummy implementation: return a hardcoded userId
        return email != null ? 1L : null;
    }
}