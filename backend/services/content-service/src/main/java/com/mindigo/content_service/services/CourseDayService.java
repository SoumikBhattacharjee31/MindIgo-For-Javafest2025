package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.CourseDayRequest;
import com.mindigo.content_service.dto.CourseDayResponse;
import com.mindigo.content_service.dto.PagedCourseDayResponse;
import com.mindigo.content_service.dto.TaskSummaryResponse;
import com.mindigo.content_service.exceptions.CourseCreationException;
import com.mindigo.content_service.exceptions.CourseDayCreationException;
import com.mindigo.content_service.exceptions.CourseNotFoundException;
import com.mindigo.content_service.models.Course;
import com.mindigo.content_service.models.CourseDay;
import com.mindigo.content_service.models.Task;
import com.mindigo.content_service.repositories.CourseDayRepository;
import com.mindigo.content_service.repositories.CourseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseDayService {
    private final CourseDayRepository courseDayRepository;
    private final CourseRepository courseRepository;

    private void validateCourseDayRequest(CourseDayRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new CourseCreationException("Course title cannot be empty");
        }
        if (request.getCourseId() == null) {
            throw new CourseCreationException("Package ID is mandatory");
        }
    }

    @Transactional
    public CourseDayResponse addCourseDay(Long usedId,
                                          CourseDayRequest request){
        validateCourseDayRequest(request);
        if(courseDayRepository.existsByTitleAndCourseId(request.getTitle(), request.getCourseId())){
            throw new CourseDayCreationException("A course day with the title '" + request.getTitle() + "' already exists in this course");
        }

        Course courseEntity = courseRepository.findById(request.getCourseId())
                .orElseThrow(()->new CourseNotFoundException("Course with "+ request.getCourseId() + "not found"));

        if(!courseEntity.getOwnerId().equals(usedId))
            throw new CourseDayCreationException("Course Day only can be added by Course owner");


        CourseDay courseDay = CourseDay.builder()
                .course(courseEntity)
                .title(request.getTitle())
                .description(request.getDescription())
                .dayNumber(0)
                .build();

        CourseDay savedCourseDay = courseDayRepository.save(courseDay);

        return CourseDayResponse.builder()
                .id(savedCourseDay.getId())
                .title(savedCourseDay.getTitle())
                .description(savedCourseDay.getDescription())
                .dayNumber(savedCourseDay.getDayNumber())
                .canEdit(true)
                .build();
    }

    @Transactional
    public void removeCourseDay(Long userId, Long courseDayId){
        CourseDay courseDay = courseDayRepository.findById(courseDayId)
                .orElseThrow(() -> new CourseDayCreationException("Course Day with ID " + courseDayId + " not found"));
        Course course = courseDay.getCourse();
        if(course == null)
            throw new CourseDayCreationException("No course under course day with ID" + courseDayId + " found ");
        if (!course.getOwnerId().equals(userId)) {
            throw new CourseCreationException("User not authorized to remove this course");
        }
        Integer currentDay = courseDay.getDayNumber();

        for(CourseDay c: course.getDays()){
            if(c.getDayNumber() > currentDay)
                c.setDayNumber(c.getDayNumber() - 1);
        }
        courseDayRepository.saveAll(course.getDays());
        courseDayRepository.delete(courseDay);
    }

    @Transactional(readOnly = true)
    public CourseDayResponse getCourseDayDetails(Long userId, Long courseDayId){
        CourseDay courseDay = courseDayRepository.findById(courseDayId)
                .orElseThrow(() -> new CourseDayCreationException("Course Day with ID " + courseDayId + " not found"));
        Course course = courseDay.getCourse();
        if(course == null)
            throw new CourseDayCreationException("No course under course day with ID" + courseDayId + " found ");
        List<Task> tasks = courseDay.getTasks();
        List<TaskSummaryResponse> taskSummaryResponses = tasks
                .stream()
                .map(
                        task -> TaskSummaryResponse.builder()
                                .id(task.getId())
                                .title(task.getTitle())
                                .available(false)
                                .progress(0D)
                                .completed(false)
                                .build())
                .toList();
        return CourseDayResponse.builder()
                .id(courseDayId)
                .title(courseDay.getTitle())
                .description(courseDay.getDescription())
                .taskList(taskSummaryResponses)
                .dayNumber(courseDay.getDayNumber())
                .canEdit(course.getOwnerId().equals(userId))
                .build();
    }

    @Transactional(readOnly = true)
    public
    PagedCourseDayResponse listCourseDayByCourseId(Long userId,
                                                          Long courseId,
                                                          int page,
                                                          int size){
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }
        Pageable pageable = PageRequest.of(page,size);
        Page<CourseDay> courseDays = courseDayRepository.findByCourseId(courseId,pageable);

        List<CourseDayResponse> courseDayResponses = courseDays
                .stream()
                .map( courseDay -> CourseDayResponse
                        .builder()
                        .id(courseDay.getId())
                        .title(courseDay.getTitle())
                        .description(courseDay.getDescription())
                        // avoiding taskList as it will not be necessary
                        .dayNumber(courseDay.getDayNumber())
                        .canEdit(courseDay.getCourse().getOwnerId().equals(userId))
                        .build())
                .toList();
        return PagedCourseDayResponse
                .builder()
                .courseDays(courseDayResponses)
                .size(courseDays.getSize())
                .page(courseDays.getNumber())
                .totalElements(courseDays.getTotalElements())
                .totalPages(courseDays.getTotalPages())
                .build();
    }
}
