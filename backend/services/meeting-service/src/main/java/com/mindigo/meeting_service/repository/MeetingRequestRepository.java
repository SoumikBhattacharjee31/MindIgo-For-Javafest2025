package com.mindigo.meeting_service.repository;

import com.mindigo.meeting_service.entity.MeetingRequest;
import com.mindigo.meeting_service.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MeetingRequestRepository extends JpaRepository<MeetingRequest, Long> {
    List<MeetingRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<MeetingRequest> findByCounselorIdOrderByCreatedAtDesc(Long counselorId);
    List<MeetingRequest> findByCounselorIdAndStatusOrderByCreatedAtDesc(Long counselorId, RequestStatus status);
    List<MeetingRequest> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, RequestStatus status);
}
