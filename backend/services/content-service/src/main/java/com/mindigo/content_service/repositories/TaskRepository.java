package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks by course day ID with pagination
    Page<Task> findByCourseDayId(Long courseDayId, Pageable pageable);

    // Find all tasks by course day ID (for reordering)
    List<Task> findByCourseDayId(Long courseDayId);

    // Check if a task with the same title exists in the course day
    boolean existsByCourseDayIdAndTitle(Long courseDayId, String title);

    // Check if a task with the same order index exists in the course day
    boolean existsByCourseDayIdAndOrderIndex(Long courseDayId, Integer orderIndex);

    // Find maximum order index for a course day
    @Query("SELECT MAX(t.orderIndex) FROM Task t WHERE t.courseDay.id = :courseDayId")
    Integer findMaxOrderIndexByCourseDayId(@Param("courseDayId") Long courseDayId);

    // Find tasks by course day ID and active status
    Page<Task> findByCourseDayIdAndActive(Long courseDayId, Boolean active, Pageable pageable);

    // Count total tasks in a course day
    long countByCourseDayId(Long courseDayId);

    // Count active tasks in a course day
    long countByCourseDayIdAndActive(Long courseDayId, Boolean active);

    // Find tasks by course day ID ordered by order index
    @Query("SELECT t FROM Task t WHERE t.courseDay.id = :courseDayId ORDER BY t.orderIndex ASC")
    List<Task> findByCourseDayIdOrderByOrderIndex(@Param("courseDayId") Long courseDayId);

    // Find tasks by course ID (across all days)
    @Query("SELECT t FROM Task t WHERE t.courseDay.course.id = :courseId")
    List<Task> findByCourseId(@Param("courseId") Long courseId);

    // Find tasks by course ID with pagination
    @Query("SELECT t FROM Task t WHERE t.courseDay.course.id = :courseId")
    Page<Task> findByCourseId(@Param("courseId") Long courseId, Pageable pageable);

    // Find tasks by task type
    @Query("SELECT t FROM Task t WHERE t.type = :taskType")
    Page<Task> findByType(@Param("taskType") com.mindigo.content_service.models.TaskType taskType, Pageable pageable);

    // Find tasks by course day and task type
    @Query("SELECT t FROM Task t WHERE t.courseDay.id = :courseDayId AND t.type = :taskType")
    List<Task> findByCourseDayIdAndType(@Param("courseDayId") Long courseDayId,
                                        @Param("taskType") com.mindigo.content_service.models.TaskType taskType);
}