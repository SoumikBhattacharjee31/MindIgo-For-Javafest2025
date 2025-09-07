package com.mindigo.discussion_service.repository;

import com.mindigo.discussion_service.entity.CommentReport;
import com.mindigo.discussion_service.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentReportRepository extends JpaRepository<CommentReport, Long> {

    Optional<CommentReport> findByCommentIdAndReporterId(Long commentId, Long reporterId);

    Long countByCommentId(Long commentId);

    Page<CommentReport> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);

    List<CommentReport> findByCommentIdOrderByCreatedAtDesc(Long commentId);
}