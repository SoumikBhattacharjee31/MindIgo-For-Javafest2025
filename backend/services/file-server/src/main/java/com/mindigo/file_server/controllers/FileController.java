package com.mindigo.file_server.controllers;

import com.mindigo.file_server.dto.ApiResponseClass;
import com.mindigo.file_server.dto.TestResponse;
import com.mindigo.file_server.services.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping("/test")
    public ResponseEntity<ApiResponseClass<TestResponse>> testingPath() {
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/file/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponseClass.success(test, "Test endpoint is up"));
    }

    @PostMapping("/upload/{type}")
    public ResponseEntity<ApiResponseClass<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String type) {
        if (!type.equals("images") && !type.equals("cvs")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST.toString()));
        }
        try {
            String fileUrl = fileService.uploadFile(file, type);
            return ResponseEntity.ok(ApiResponseClass.success(fileUrl, "File uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Upload failed: " + e.getMessage(), HttpStatus.BAD_REQUEST.toString()));
        }
    }

    @GetMapping("/list/{type}")
    public ResponseEntity<ApiResponseClass<?>> listFiles(
            @PathVariable String type,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Admin access required", HttpStatus.FORBIDDEN.toString()));
        }
        if (!type.equals("images") && !type.equals("cvs")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST.toString()));
        }
        try {
            return ResponseEntity.ok(ApiResponseClass.success(fileService.listFiles(type), "Files listed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseClass.error("List failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.toString()));
        }
    }

    @DeleteMapping("/delete/{type}/{filename}")
    public ResponseEntity<ApiResponseClass<String>> deleteFile(
            @PathVariable String type,
            @PathVariable String filename,
            @RequestHeader(value = "X-User-Role", defaultValue = "") String role) {
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponseClass.error("Admin access required", HttpStatus.FORBIDDEN.toString()));
        }
        if (!type.equals("images") && !type.equals("cvs")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST.toString()));
        }
        try {
            fileService.deleteFile(type, filename);
            return ResponseEntity.ok(ApiResponseClass.success("File deleted successfully", "File deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseClass.error("Deletion failed: " + e.getMessage(), HttpStatus.BAD_REQUEST.toString()));
        }
    }
}