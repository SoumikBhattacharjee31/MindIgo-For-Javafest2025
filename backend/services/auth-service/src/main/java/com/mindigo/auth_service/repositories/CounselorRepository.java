package com.mindigo.auth_service.repositories;

import com.mindigo.auth_service.entity.Counselor;
import com.mindigo.auth_service.entity.CounselorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CounselorRepository extends JpaRepository<Counselor, Long> {
    boolean existsByLicenseNumber(String licenseNumber);

    Page<Counselor> findAll(Specification<Counselor> spec, Pageable pageable);
}