package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Cycle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CycleRepository extends JpaRepository<Cycle,Long> {
}
