package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByTitleAndPackageEntityId(String title, Long packageId);
    Page<Course> findByOwnerId(Long ownerId, Pageable pageable);
    Page<Course> findByActiveTrue(Pageable pageable);
    Page<Course> findByPackageEntityId(Long packageId, Pageable pageable);
}