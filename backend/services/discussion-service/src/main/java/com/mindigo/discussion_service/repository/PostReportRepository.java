package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.PostReport;
import com.mindigo.discussion_service.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReportRepository extends JpaRepository<PostReport, Long> {

    Optional<PostReport> findByPostIdAndReporterId(Long postId, Long reporterId);

    Long countByPostId(Long postId);

    Page<PostReport> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    List<PostReport> findByPostIdOrderByCreatedAtDesc(Long postId);
}