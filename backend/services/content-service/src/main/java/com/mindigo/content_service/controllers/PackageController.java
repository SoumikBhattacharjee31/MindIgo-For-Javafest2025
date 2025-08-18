package com.mindigo.content_service.controllers;

import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.PackageRequest;
import com.mindigo.content_service.dto.PagedPackageResponse;
import com.mindigo.content_service.dto.PackageResponse;
import com.mindigo.content_service.exceptions.PackageCreationException;
import com.mindigo.content_service.exceptions.PackageNotFoundException;
import com.mindigo.content_service.services.PackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/content/package")
@Tag(name = "Package Section on Content Service", description = "Manage packages: create, remove, activate, list, edit, and view details")
@Slf4j
@RequiredArgsConstructor
@Validated
public class PackageController {
    private final PackageService packageService;

    private boolean isNotAuthorized(String role) {
        return !role.equalsIgnoreCase("COUNSELOR") && !role.equalsIgnoreCase("ADMIN");
    }

    @PostMapping("/add")
    @Operation(summary = "Create a new package", description = "Allows COUNSELOR or ADMIN to create a package")
    @ApiResponse(responseCode = "201", description = "Package created successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<PackageResponse>> addPackage(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @Valid @RequestBody PackageRequest request) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized package creation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            PackageResponse response = packageService.addPackage(Long.parseLong(userId), request);
            log.info("Package '{}' created successfully by user: {}", request.getName(), userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseClass.success(response, "Package created successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (PackageCreationException e) {
            log.error("Validation error creating package: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error creating package: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @DeleteMapping("/{packageId}")
    @Operation(summary = "Remove a package", description = "Allows COUNSELOR or ADMIN to remove a package")
    @ApiResponse(responseCode = "200", description = "Package removed successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Package not found")
    public ResponseEntity<ApiResponseClass<Void>> removePackage(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long packageId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized package removal attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            packageService.removePackage(Long.parseLong(userId), packageId);
            log.info("Package {} removed successfully by user: {}", packageId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(null, "Package removed successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (PackageNotFoundException e) {
            log.error("Package not found: {}", packageId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Unexpected error removing package: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }

    @PatchMapping("/activate/{packageId}")
    @Operation(summary = "Activate a package", description = "Allows COUNSELOR or ADMIN to activate a package if it has at least one active course")
    @ApiResponse(responseCode = "200", description = "Package activated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Package not found")
    @ApiResponse(responseCode = "400", description = "No active courses in package")
    public ResponseEntity<ApiResponseClass<PackageResponse>> activatePackage(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long packageId) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized package activation attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            PackageResponse response = packageService.activatePackage(Long.parseLong(userId), packageId);
            log.info("Package {} activated successfully by user: {}", packageId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Package activated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (PackageNotFoundException e) {
            log.error("Package not found: {}", packageId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Unexpected error activating package: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/list/my")
    @Operation(summary = "List my packages", description = "Lists all packages owned by the user with pagination using userId")
    @ApiResponse(responseCode = "200", description = "Packages retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid userId or pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedPackageResponse>> listMyPackages(
            @RequestHeader(value = "X-User-Id") String userId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        try {
            PagedPackageResponse packages = packageService.listPackagesByUserId(Long.parseLong(userId), page, size);
            log.info("Packages retrieved successfully for userId: {}", userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(packages, "Packages retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (Exception e) {
            log.error("Error listing packages for userId {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    //TODO: needs to be tested after integration of auth-service for resolving user id via email
    @GetMapping("/list/email")
    @Operation(summary = "List packages by email", description = "Lists all packages owned by the user with pagination using email")
    @ApiResponse(responseCode = "200", description = "Packages retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid email or pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedPackageResponse>> listPackagesByEmail(
            @RequestParam @Email String email,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        try {
            PagedPackageResponse packages = packageService.listPackagesByEmail(email, page, size);
            log.info("Packages retrieved successfully for email: {}", email);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(packages, "Packages retrieved successfully"));
        } catch (Exception e) {
            log.error("Error listing packages for email {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/list/active")
    @Operation(summary = "List active packages", description = "Lists all activated packages with pagination")
    @ApiResponse(responseCode = "200", description = "Active packages retrieved successfully")
    @ApiResponse(responseCode = "400", description = "Invalid pagination parameters")
    public ResponseEntity<ApiResponseClass<PagedPackageResponse>> listActivePackages(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        try {
            PagedPackageResponse packages = packageService.listActivePackages(page, size);
            log.info("Active packages retrieved successfully, page: {}, size: {}", page, size);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(packages, "Active packages retrieved successfully"));
        } catch (Exception e) {
            log.error("Error listing active packages: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @GetMapping("/{packageId}")
    @Operation(summary = "Get package details", description = "Retrieves details of a specific package")
    @ApiResponse(responseCode = "200", description = "Package details retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Package not found")
    @ApiResponse(responseCode = "400", description = "Invalid userId")
    public ResponseEntity<ApiResponseClass<PackageResponse>> getPackageDetails(
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long packageId) {
        try {
            PackageResponse response = packageService.getPackageDetails(packageId, Long.parseLong(userId));
            log.info("Package {} details retrieved successfully for user: {}", packageId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Package details retrieved successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (PackageNotFoundException e) {
            log.error("Package not found: {}", packageId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (Exception e) {
            log.error("Error retrieving package details: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        }
    }

    @PutMapping("/edit/{packageId}")
    @Operation(summary = "Edit a package", description = "Allows COUNSELOR or ADMIN to partially update a package")
    @ApiResponse(responseCode = "200", description = "Package updated successfully")
    @ApiResponse(responseCode = "403", description = "Unauthorized access")
    @ApiResponse(responseCode = "404", description = "Package not found")
    @ApiResponse(responseCode = "400", description = "Invalid input")
    public ResponseEntity<ApiResponseClass<PackageResponse>> updatePackage(
            @RequestHeader(value = "X-User-Role") String role,
            @RequestHeader(value = "X-User-Id") String userId,
            @PathVariable Long packageId,
            @RequestBody PackageRequest packageRequest) {
        try {
            if (isNotAuthorized(role)) {
                log.warn("Unauthorized package update attempt by user: {}", userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponseClass.error("Unauthorized access", "403"));
            }
            PackageResponse response = packageService.updatePackage(Long.parseLong(userId), packageId, packageRequest);
            log.info("Package {} updated successfully by user: {}", packageId, userId);
            return ResponseEntity.ok()
                    .body(ApiResponseClass.success(response, "Package updated successfully"));
        } catch (NumberFormatException e) {
            log.error("Invalid userId format: {}", userId);
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error("Invalid user ID format", "400"));
        } catch (PackageNotFoundException e) {
            log.error("Package not found: {}", packageId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseClass.error(e.getMessage(), "404"));
        } catch (PackageCreationException e) {
            log.error("Validation error updating package: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponseClass.error(e.getMessage(), "400"));
        } catch (Exception e) {
            log.error("Unexpected error updating package: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("Unexpected error occurred", "500"));
        }
    }
}