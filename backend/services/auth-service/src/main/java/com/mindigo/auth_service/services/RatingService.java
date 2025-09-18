package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.request.RateCounselorRequest;
import com.mindigo.auth_service.dto.response.CounselorRatingResponse;
import com.mindigo.auth_service.entity.Counselor;
import com.mindigo.auth_service.entity.CounselorRating;
import com.mindigo.auth_service.entity.User;
import com.mindigo.auth_service.exception.BadRequestException;
import com.mindigo.auth_service.exception.UserNotFoundException;
import com.mindigo.auth_service.repositories.CounselorRatingRepository;
import com.mindigo.auth_service.repositories.CounselorRepository;
import com.mindigo.auth_service.repositories.UserRepository;
import com.mindigo.auth_service.utils.CookieHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {

    private final CounselorRatingRepository ratingRepository;
    private final CounselorRepository counselorRepository;
    private final UserRepository userRepository;
    private final CookieHelper cookieHelper;

    @Transactional
    public void rateCounselor(RateCounselorRequest request, HttpServletRequest httpRequest) {
        String userEmail = cookieHelper.getEmailFromCookie(httpRequest);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found. Cannot submit rating."));

        Counselor counselor = counselorRepository.findById(request.getCounselorId())
                .orElseThrow(() -> new UserNotFoundException("Counselor not found."));

        if (ratingRepository.existsByCounselorIdAndUserId(counselor.getId(), user.getId())) {
            throw new BadRequestException("You have already rated this counselor.");
        }

        CounselorRating rating = CounselorRating.builder()
                .counselor(counselor)
                .user(user)
                .rating(request.getRating())
                .review(request.getReview())
                .build();

        ratingRepository.save(rating);
        log.info("User {} rated counselor {}", user.getEmail(), counselor.getUser().getEmail());

        // After saving, update the counselor's average rating
        updateCounselorAverageRating(counselor);
    }

    private void updateCounselorAverageRating(Counselor counselor) {
        List<CounselorRating> ratings = ratingRepository.findByCounselorId(counselor.getId());

        if (ratings.isEmpty()) {
            counselor.setAverageRating(0.0);
            counselor.setTotalRatings(0);
        } else {
            double average = ratings.stream()
                    .mapToInt(CounselorRating::getRating)
                    .average()
                    .orElse(0.0);
            counselor.setAverageRating(Math.round(average * 10.0) / 10.0); // Round to one decimal place
            counselor.setTotalRatings(ratings.size());
        }
        counselorRepository.save(counselor);
        log.info("Updated average rating for counselor ID {} to {}", counselor.getId(), counselor.getAverageRating());
    }

    /**
     * Retrieves a paginated list of ratings for a specific counselor.
     *
     * @param counselorId The ID of the counselor.
     * @param page The page number to retrieve (0-indexed).
     * @param size The number of items per page.
     * @return A Page of DTOs representing the counselor ratings.
     */
    public Page<CounselorRatingResponse> getRatingsForCounselor(Long counselorId, int page, int size) {
        if (!counselorRepository.existsById(counselorId)) {
            throw new UserNotFoundException("Counselor not found.");
        }

        // Create a Pageable object, sorting reviews by the most recent first
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<CounselorRating> ratingsPage = ratingRepository.findByCounselorId(counselorId, pageable);

        // Use the .map() function of the Page object to convert entities to DTOs
        return ratingsPage.map(rating -> CounselorRatingResponse.builder()
                .userName(rating.getUser().getName())
                .userProfileImageUrl(rating.getUser().getProfileImageUrl())
                .rating(rating.getRating())
                .review(rating.getReview())
                .createdAt(rating.getCreatedAt())
                .build());
    }
}