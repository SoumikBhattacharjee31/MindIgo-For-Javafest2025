package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Package;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    boolean existsByName(String name);
    Page<Package> findByOwnerId(Long ownerId, Pageable pageable);
    Page<Package> findByActiveTrue(Pageable pageable);
}