package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.CourseDay;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseDayRepository extends JpaRepository<CourseDay,Long> {
    boolean existsByTitleAndCourseId(String title,Long courseId);
    Page<CourseDay> findByCourseId(Long courseId, Pageable pageable);
}
