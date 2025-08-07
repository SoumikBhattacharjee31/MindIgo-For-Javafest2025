package com.mindigo.file_server.controllers;

import com.mindigo.file_server.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<TestResponse>> testingPath() {
        TestResponse test = TestResponse
                .builder()
                .api("api/v1/file/test")
                .status("UP")
                .build();
        return ResponseEntity.ok(ApiResponse.success(test, "Test endpoint is up"));
    }

    @PostMapping("/upload/{type}")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @PathVariable String type) {
        System.out.println("=====================================================");
        if (!type.equals("images") && !type.equals("cvs")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST));
        }
        try {
            String fileUrl = fileService.uploadFile(file, type);
            System.out.println("done");
            return ResponseEntity.ok(ApiResponse.success(fileUrl, "File uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @GetMapping("/list/{type}")
    public ResponseEntity<ApiResponse<?>> listFiles(
            @PathVariable String type,
            @RequestHeader(value = "X-Role", defaultValue = "") String role) {
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Admin access required", HttpStatus.FORBIDDEN));
        }
        if (!type.equals("images") && !type.equals("cvs")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST));
        }
        try {
            return ResponseEntity.ok(ApiResponse.success(fileService.listFiles(type), "Files listed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("List failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @DeleteMapping("/delete/{type}/{filename}")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @PathVariable String type,
            @PathVariable String filename,
            @RequestHeader(value = "X-Role", defaultValue = "") String role) {
        if (!role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Admin access required", HttpStatus.FORBIDDEN));
        }
        if (!type.equals("images") && !type.equals("cvs")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid type: must be 'images' or 'cvs'", HttpStatus.BAD_REQUEST));
        }
        try {
            fileService.deleteFile(type, filename);
            return ResponseEntity.ok(ApiResponse.success("File deleted successfully", "File deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Deletion failed: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
}