package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback,Long> {
}
