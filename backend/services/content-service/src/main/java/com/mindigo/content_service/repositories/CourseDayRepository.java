package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.CourseDay;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseDayRepository extends JpaRepository<CourseDay,Long> {
}
