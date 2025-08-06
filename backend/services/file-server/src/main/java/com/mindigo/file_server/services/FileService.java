package com.mindigo.file_server.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindigo.file_server.exceptions.FileOperationException;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class FileService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket}")
    private String bucketName;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public FileService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public String uploadFile(MultipartFile file,
                             String type) throws FileOperationException {
        try {
            String extension = FilenameUtils.getExtension(file.getOriginalFilename());
            String fileName = FilenameUtils.getBaseName(file.getOriginalFilename()) + "_" + UUID.randomUUID() + "." + extension;
            String filePath = type + "/" + fileName;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("Content-Type", file.getContentType())
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filePath;
            } else {
                throw new FileOperationException("Failed to upload file: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            throw new FileOperationException("Error uploading file: " + e.getMessage(), e);
        }
    }

    public List<String> listFiles(String type) throws FileOperationException {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/list/" + bucketName))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{\"prefix\": \"" + type + "/\", \"limit\": 100}"))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return StreamSupport.stream(objectMapper.readTree(response.body()).spliterator(), false)
                        .map(node -> supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + type + "/" + node.get("name").asText())
                        .collect(Collectors.toList());
            } else {
                throw new FileOperationException("Failed to list files: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            throw new FileOperationException("Error listing files: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String type,
                           String filename) throws FileOperationException {
        try {
            String filePath = type + "/" + filename;
            ObjectMapper mapper = new ObjectMapper();
            Map<String, List<String>> bodyMap = Map.of("prefixes", List.of(filePath));
            String body = mapper.writeValueAsString(bodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucketName))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("Content-Type", "application/json")
                    .method("DELETE", HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new FileOperationException("Failed to delete file: " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            throw new FileOperationException("Error deleting file: " + e.getMessage(), e);
        }
    }
}