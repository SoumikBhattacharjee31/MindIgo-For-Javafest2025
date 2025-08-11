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
        validateCourseRequest(courseRequest);

        if (courseRepository.existsByTitleAndPackageEntityId(courseRequest.getTitle(), courseRequest.getPackageId())) {
            throw new CourseCreationException("A course with the title '" + courseRequest.getTitle() + "' already exists in this package");
        }

        Package packageEntity = packageRepository.findById(courseRequest.getPackageId())
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + courseRequest.getPackageId() + " not found"));

        if(!packageEntity.getOwnerId().equals(userId))
            throw  new CourseCreationException("Course owner and Package owner needs to be same user");

        Course newCourse = Course.builder()
                .title(courseRequest.getTitle())
                .description(courseRequest.getDescription())
                .ownerId(userId)
                .active(false)
                .packageEntity(packageEntity)
                .durationDays(0)
                .build();

        Course savedCourse = courseRepository.save(newCourse);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .active(savedCourse.getActive())
                .enrolled(false)
                .progress(0.0)
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    private void validateCourseRequest(CourseRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new CourseCreationException("Course title cannot be empty");
        }
        if (request.getPackageId() == null) {
            throw new CourseCreationException("Package ID is mandatory");
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
                .active(savedCourse.getActive())
                .enrolled(false)
                .progress(0.0)
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedCourseResponse listCoursesByPackageId(Long userId, Long packageId, int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Course> courses = courseRepository.findByPackageEntityId(packageId, pageable);

        List<CourseResponse> courseContent = courses.getContent().stream()
                .map(course -> CourseResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .active(course.getActive())
                        .enrolled(false)
                        .progress(0.0)
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
    public CourseResponse getCourseDetails(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .active(course.getActive())
                .enrolled(false)
                .progress(0.0)
                .durationDays(course.getDurationDays())
                .canEdit(userId.equals(course.getOwnerId()))
                .build();
    }

    @Transactional
    public CourseResponse updateCourse(Long userId, Long courseId, CourseRequest courseRequest) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseCreationException("Course with ID " + courseId + " not found"));

        if (!course.getOwnerId().equals(userId)) {
            throw new CourseCreationException("User not authorized to update this course");
        }

        if (courseRequest.getTitle() != null && !courseRequest.getTitle().trim().isEmpty()) {
            if (!course.getTitle().equals(courseRequest.getTitle()) &&
                    courseRepository.existsByTitleAndPackageEntityId(courseRequest.getTitle(), course.getPackageEntity().getId())) {
                throw new CourseCreationException("A course with the title '" + courseRequest.getTitle() + "' already exists in this package");
            }
            course.setTitle(courseRequest.getTitle());
        }
        if (courseRequest.getDescription() != null) {
            course.setDescription(courseRequest.getDescription());
        }
        if (courseRequest.getPackageId() != null) {
            Package packageEntity = packageRepository.findById(courseRequest.getPackageId())
                    .orElseThrow(() -> new PackageNotFoundException("Package with ID " + courseRequest.getPackageId() + " not found"));
            if(!packageEntity.getOwnerId().equals(course.getOwnerId()))
                throw new CourseCreationException("Package with ID " + courseRequest.getPackageId() + " doesn't belong to this owner");
            course.setPackageEntity(packageEntity);
        }

        Course savedCourse = courseRepository.save(course);

        return CourseResponse.builder()
                .id(savedCourse.getId())
                .title(savedCourse.getTitle())
                .description(savedCourse.getDescription())
                .active(savedCourse.getActive())
                .enrolled(false)
                .progress(0.0)
                .durationDays(savedCourse.getDurationDays())
                .canEdit(true)
                .build();
    }
}