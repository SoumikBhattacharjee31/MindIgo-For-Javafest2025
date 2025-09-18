package com.mindigo.file_server.controllers;

import com.mindigo.file_server.dto.ApiResponseClass;
import com.mindigo.file_server.dto.TestResponse;
import com.mindigo.file_server.services.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/file")
public class FileController {

    private static final Set<String> ALLOWED_TYPES = Set.of("images", "cvs","audios","paper");
    private static final String ADMIN_ROLE = "ADMIN";

    @Autowired
    private FileService fileService;

    @GetMapping("/test")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        TestResponse test = TestResponse.builder()
                .api("api/v1/file/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponseClass.success(test, "Test endpoint is up"));
    }

    @PostMapping("/upload/{type}")
    public ResponseEntity<ApiResponseClass<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String type) {
        return validateType(type, () -> {
            String fileUrl = fileService.uploadFile(file, type);
            return ApiResponseClass.success(fileUrl, "File uploaded successfully");
        });
    }

    @GetMapping("/list/{type}")
    public ResponseEntity<ApiResponseClass<List<String>>> listFiles(
            @PathVariable String type,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        return validateAdmin(role, () ->
                validateType(type, () ->
                        ApiResponseClass.success(fileService.listFiles(type), "Files listed successfully")
                ).getBody()
        );
    }

    @DeleteMapping("/delete/{type}/{filename}")
    public ResponseEntity<ApiResponseClass<String>> deleteFile(
            @PathVariable String type,
            @PathVariable String filename,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        return validateAdmin(role, () ->
                validateType(type, () -> {
                    fileService.deleteFile(type, filename);
                    return ApiResponseClass.success("File deleted successfully", "File deleted successfully");
                }).getBody()
        );
    }

    private <T> ResponseEntity<ApiResponseClass<T>> validateType(
            String type,
            ApiAction<T> action) {
        if (!ALLOWED_TYPES.contains(type)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST.toString()));
        }
        return execute(action, HttpStatus.BAD_REQUEST);
    }

    private <T> ResponseEntity<ApiResponseClass<T>> validateAdmin(
            String role,
            ApiAction<T> action) {
        if (!ADMIN_ROLE.equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Admin access required", HttpStatus.FORBIDDEN.toString()));
        }
        return execute(action, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private <T> ResponseEntity<ApiResponseClass<T>> execute(
            ApiAction<T> action,
            HttpStatus errorStatus) {
        try {
            return ResponseEntity.ok(action.execute());
        } catch (Exception e) {
            return ResponseEntity.status(errorStatus)
                    .body(ApiResponseClass.error(e.getMessage(), errorStatus.toString()));
        }
    }

    @FunctionalInterface
    private interface ApiAction<T> {
        ApiResponseClass<T> execute() throws Exception;
    }
}
