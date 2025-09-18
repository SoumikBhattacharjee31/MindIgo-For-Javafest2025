package com.mindigo.file_server.controllers;

import com.mindigo.file_server.dto.ApiResponseClass;
import com.mindigo.file_server.dto.TestResponse;
import com.mindigo.file_server.services.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/v1/file")
public class FileController {

    private static final Set<String> ALLOWED_TYPES = Set.of("images", "cvs", "audios", "papers", "reports");
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String ADMIN_ROLE_2 = "ADMINISTRATOR";

    @Autowired
    private FileService fileService;

    @GetMapping("/test")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        log.info("Received request on /test endpoint");
        TestResponse test = TestResponse.builder()
                .api("api/v1/file/test")
                .status("UP")
                .build();
        log.info("Test endpoint is healthy");
        return ResponseEntity.ok(ApiResponseClass.success(test, "Test endpoint is up"));
    }

    @PostMapping("/upload/{type}")
    public ResponseEntity<ApiResponseClass<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String type) {
        log.info("Upload request received. Type: {}, File name: {}", type, file.getOriginalFilename());
        return validateType(type, () -> {
            String fileUrl = fileService.uploadFile(file, type);
            log.info("File uploaded successfully. Type: {}, File URL: {}", type, fileUrl);
            return ApiResponseClass.success(fileUrl, "File uploaded successfully");
        });
    }

    @GetMapping("/list/{type}")
    public ResponseEntity<ApiResponseClass<List<String>>> listFiles(
            @PathVariable String type,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        log.info("List request received. Type: {}, Requested by role: {}", type, role);
        return validateAdmin(role, () ->
                validateType(type, () -> {
                    List<String> files = fileService.listFiles(type);
                    log.info("Files listed successfully. Type: {}, File count: {}", type, files.size());
                    return ApiResponseClass.success(files, "Files listed successfully");
                }).getBody()
        );
    }

    @DeleteMapping("/delete/{type}/{filename}")
    public ResponseEntity<ApiResponseClass<String>> deleteFile(
            @PathVariable String type,
            @PathVariable String filename,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        log.info("Delete request received. Type: {}, Filename: {}, Requested by role: {}", type, filename, role);
        return validateAdmin(role, () ->
                validateType(type, () -> {
                    fileService.deleteFile(type, filename);
                    log.info("File deleted successfully. Type: {}, Filename: {}", type, filename);
                    return ApiResponseClass.success("File deleted successfully", "File deleted successfully");
                }).getBody()
        );
    }

    private <T> ResponseEntity<ApiResponseClass<T>> validateType(
            String type,
            ApiAction<T> action) {
        if (!ALLOWED_TYPES.contains(type)) {
            log.warn("Invalid type received: {}", type);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST.toString()));
        }
        log.debug("Validated file type: {}", type);
        return execute(action, HttpStatus.BAD_REQUEST);
    }

    private <T> ResponseEntity<ApiResponseClass<T>> validateAdmin(
            String role,
            ApiAction<T> action) {
        if (!ADMIN_ROLE.equalsIgnoreCase(role) && !ADMIN_ROLE_2.equalsIgnoreCase(role)) {
            log.error("Access denied. Role '{}' is not authorized as admin", role);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Admin access required", HttpStatus.FORBIDDEN.toString()));
        }
        log.debug("Admin role validated: {}", role);
        return execute(action, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private <T> ResponseEntity<ApiResponseClass<T>> execute(
            ApiAction<T> action,
            HttpStatus errorStatus) {
        try {
            log.debug("Executing action with error fallback status: {}", errorStatus);
            ApiResponseClass<T> result = action.execute();
            log.debug("Action executed successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error executing action: {}", e.getMessage(), e);
            return ResponseEntity.status(errorStatus)
                    .body(ApiResponseClass.error(e.getMessage(), errorStatus.toString()));
        }
    }

    @FunctionalInterface
    private interface ApiAction<T> {
        ApiResponseClass<T> execute() throws Exception;
    }
}
