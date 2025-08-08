package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task,Long> {
}
