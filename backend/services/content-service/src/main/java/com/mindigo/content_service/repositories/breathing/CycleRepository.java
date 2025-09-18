package com.mindigo.content_service.repositories.breathing;

import com.mindigo.content_service.models.breathing.Cycle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CycleRepository extends JpaRepository<Cycle,Long> {
}
