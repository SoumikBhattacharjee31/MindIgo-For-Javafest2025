package com.mindigo.content_service.repositories.breathing;

import com.mindigo.content_service.models.breathing.BreathingTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BreathingTaskRepository extends JpaRepository<BreathingTask,Long> {
}
