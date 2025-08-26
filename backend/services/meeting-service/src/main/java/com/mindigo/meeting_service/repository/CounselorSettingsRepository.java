package com.mindigo.meeting_service.repository;

import com.mindigo.meeting_service.entity.CounselorSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CounselorSettingsRepository extends JpaRepository<CounselorSettings, Long> {
    Optional<CounselorSettings> findByCounselorId(Long counselorId);
}
