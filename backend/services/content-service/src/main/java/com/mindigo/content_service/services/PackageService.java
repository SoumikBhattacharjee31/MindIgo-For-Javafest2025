package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.CourseSummaryResponse;
import com.mindigo.content_service.dto.PackageRequest;
import com.mindigo.content_service.dto.PagedPackageResponse;
import com.mindigo.content_service.dto.PackageResponse;
import com.mindigo.content_service.exceptions.PackageCreationException;
import com.mindigo.content_service.exceptions.PackageNotFoundException;
import com.mindigo.content_service.models.Course;
import com.mindigo.content_service.models.Package;
import com.mindigo.content_service.repositories.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PackageService {
    private final PackageRepository packageRepository;

    @Transactional
    public PackageResponse addPackage(Long userId, PackageRequest packageRequest) {
        validatePackageRequest(packageRequest);

        if (packageRepository.existsByName(packageRequest.getName())) {
            throw new PackageCreationException("A package with the name '" + packageRequest.getName() + "' already exists");
        }

        Package newPackage = Package.builder()
                .name(packageRequest.getName())
                .description(packageRequest.getDescription())
                .ownerId(userId)
                .price(packageRequest.getPrice())
                .free(packageRequest.getFree())
                .active(false)
                .build();

        Package savedPackage = packageRepository.save(newPackage);

        return PackageResponse.builder()
                .id(savedPackage.getId())
                .name(savedPackage.getName())
                .description(savedPackage.getDescription())
                .price(savedPackage.getPrice())
                .free(savedPackage.getFree())
                .active(savedPackage.getActive())
                .canEdit(true)
                .build();
    }

    private void validatePackageRequest(PackageRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new PackageCreationException("Package name cannot be empty");
        }
        if (request.getPrice() < 0) {
            throw new PackageCreationException("Price cannot be negative");
        }
        if (request.getFree() && request.getPrice() != 0.0) {
            throw new PackageCreationException("Price of a free package must be 0");
        }
        if (!request.getFree()  && request.getPrice() == 0.0) {
            throw new PackageCreationException("Price of a not-free package must be greater than 0");
        }
    }

    @Transactional
    public void removePackage(Long userId, Long packageId) {
        Package packageEntity = packageRepository.findById(packageId)
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + packageId + " not found"));

        if (!packageEntity.getOwnerId().equals(userId)) {
            throw new PackageNotFoundException("User not authorized to remove this package");
        }

        packageRepository.delete(packageEntity);
    }

    @Transactional
    public PackageResponse activatePackage(Long userId, Long packageId) {
        Package packageEntity = packageRepository.findById(packageId)
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + packageId + " not found"));

        if (!packageEntity.getOwnerId().equals(userId)) {
            throw new PackageNotFoundException("User not authorized to activate this package");
        }

        boolean hasActiveCourse = packageEntity.getCourses().stream()
                .anyMatch(Course::getActive);

        if (!hasActiveCourse) {
            throw new PackageCreationException("Cannot activate package: No active courses found");
        }

        packageEntity.setActive(true);
        Package savedPackage = packageRepository.save(packageEntity);

        return PackageResponse.builder()
                .id(savedPackage.getId())
                .name(savedPackage.getName())
                .description(savedPackage.getDescription())
                .price(savedPackage.getPrice())
                .free(savedPackage.getFree())
                .active(savedPackage.getActive())
                .canEdit(true)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedPackageResponse listPackagesByUserId(Long userId, int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Package> packages = packageRepository.findByOwnerId(userId, pageable);

        List<PackageResponse> packageContent = packages.getContent().stream()
                .map(packageEntity -> PackageResponse.builder()
                        .id(packageEntity.getId())
                        .name(packageEntity.getName())
                        .description(packageEntity.getDescription())
                        .price(packageEntity.getPrice())
                        .free(packageEntity.getFree())
                        .active(packageEntity.getActive())
                        .canEdit(packageEntity.getOwnerId().equals(userId))
                        .build())
                .toList();

        return PagedPackageResponse.builder()
                .packages(packageContent)
                .size(packages.getSize())
                .page(packages.getNumber())
                .totalElements(packages.getTotalElements())
                .totalPages(packages.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedPackageResponse listPackagesByEmail(String email, int page, int size) {
        // TODO: Replace with actual auth-service call to resolve userId from email
        Long userId = resolveUserIdFromEmail(email);
        return listPackagesByUserId(userId, page, size);
    }

    @Transactional(readOnly = true)
    public PagedPackageResponse listActivePackages(int page, int size) {
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("Invalid pagination parameters: page must be >= 0, size must be >= 1");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<Package> packages = packageRepository.findByActiveTrue(pageable);

        List<PackageResponse> packageContent = packages.getContent().stream()
                .map(packageEntity -> PackageResponse.builder()
                        .id(packageEntity.getId())
                        .name(packageEntity.getName())
                        .description(packageEntity.getDescription())
                        .price(packageEntity.getPrice())
                        .free(packageEntity.getFree())
                        .active(packageEntity.getActive())
                        .canEdit(false) // No userId provided, so canEdit is false
                        .build())
                .toList();

        return PagedPackageResponse.builder()
                .packages(packageContent)
                .size(packages.getSize())
                .page(packages.getNumber())
                .totalElements(packages.getTotalElements())
                .totalPages(packages.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PackageResponse getPackageDetails(Long packageId, Long userId) {
        Package packageEntity = packageRepository.findById(packageId)
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + packageId + " not found"));
        List<Course> courseList = packageEntity.getCourses();

        List<CourseSummaryResponse> courseSummaryResponseList = courseList.stream()
                .map(course ->
                    CourseSummaryResponse
                            .builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .active(course.getActive())
                            .build()
                )
                .toList();

        return PackageResponse.builder()
                .id(packageEntity.getId())
                .name(packageEntity.getName())
                .description(packageEntity.getDescription())
                .price(packageEntity.getPrice())
                .free(packageEntity.getFree())
                .active(packageEntity.getActive())
                .canEdit(userId.equals(packageEntity.getOwnerId()))
                .courses(courseSummaryResponseList)
                .build();
    }

    private Long resolveUserIdFromEmail(String email) {
        // TODO: Implement actual auth-service call to resolve userId from email
        // Dummy implementation: return a hardcoded userId
        return 1L;
    }

    @Transactional
    public PackageResponse updatePackage(Long userId, Long packageId, PackageRequest packageRequest) {
        Package packageEntity = packageRepository.findById(packageId)
                .orElseThrow(() -> new PackageNotFoundException("Package with ID " + packageId + " not found"));

        if (!packageEntity.getOwnerId().equals(userId)) {
            throw new PackageNotFoundException("User not authorized to update this package");
        }

        boolean needsValidation = false;

        if (packageRequest.getName() != null && !packageRequest.getName().trim().isEmpty()) {
            if (!packageEntity.getName().equals(packageRequest.getName()) &&
                    packageRepository.existsByName(packageRequest.getName())) {
                throw new PackageCreationException("A package with the name '" + packageRequest.getName() + "' already exists");
            }
            packageEntity.setName(packageRequest.getName());
        }
        if (packageRequest.getDescription() != null) {
            packageEntity.setDescription(packageRequest.getDescription());
        }
        if (packageRequest.getPrice() != null) {
            if (packageRequest.getPrice() < 0) {
                throw new PackageCreationException("Price cannot be negative");
            }
            packageEntity.setPrice(packageRequest.getPrice());
            needsValidation = true;
        }
        if (packageRequest.getFree() != null) {
            packageEntity.setFree(packageRequest.getFree());
            needsValidation = true;
        }

        if (needsValidation && packageEntity.getFree() && packageEntity.getPrice() != 0.0) {
            throw new PackageCreationException("Price of a free package must be 0");
        }
        if (needsValidation && !packageEntity.getFree() && packageEntity.getPrice() == 0.0) {
            throw new PackageCreationException("Price of a not-free package must be greater than 0");
        }

        Package savedPackage = packageRepository.save(packageEntity);

        return PackageResponse.builder()
                .id(savedPackage.getId())
                .name(savedPackage.getName())
                .description(savedPackage.getDescription())
                .price(savedPackage.getPrice())
                .free(savedPackage.getFree())
                .active(savedPackage.getActive())
                .canEdit(true)
                .build();
    }
}