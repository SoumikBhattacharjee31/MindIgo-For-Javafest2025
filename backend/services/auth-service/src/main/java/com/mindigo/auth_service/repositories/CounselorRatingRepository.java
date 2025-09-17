package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.entity.CounselorRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CounselorRatingRepository extends JpaRepository<CounselorRating, Long> {

    /**
     * Finds a paginated list of ratings for a specific counselor.
     *
     * @param counselorId The ID of the counselor.
     * @param pageable    The pagination information (page number, size, sort).
     * @return A Page of CounselorRating entities.
     */
    Page<CounselorRating> findByCounselorId(Long counselorId, Pageable pageable);

    // This method is used for updating the average and can remain as is
    List<CounselorRating> findByCounselorId(Long counselorId);

    // Check if a user has already rated a counselor
    boolean existsByCounselorIdAndUserId(Long counselorId, Long userId);
}