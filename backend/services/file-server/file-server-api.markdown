# File Service API Documentation

This API provides endpoints for uploading, listing, and deleting files in a Supabase storage bucket, supporting two file types: images and CSVs. Built using Spring Boot, it uses a standardized `ApiResponse` DTO for consistent response formatting.

## Base URL
```
localhost:8085
localhost:8080 #if gateway active
```

## Response Format
All endpoints return responses wrapped in the `ApiResponse` DTO, defined as follows:

```java
@Data
@Builder
public class ApiResponse<T> {
    private boolean success;     // Indicates if the operation was successful
    private T data;             // The response data (type varies by endpoint)
    private String message;     // A message describing the result
    private HttpStatus status;  // HTTP status code (e.g., OK, BAD_REQUEST)
}
```

- **Success Response Example**:
  ```json
  {
    "success": true,
    "data":"<data>",
    "message": "<success-message>",
    "status": "OK"
  }
  ```
- **Error Response Example**:
  ```json
  {
    "success": false,
    "data": null,
    "message": "<error-message>",
    "status": "<http-status>"
  }
  ```

## Endpoints

### 1. Test Endpoint
- **Description**: Checks if the file service API is operational.
- **Method**: GET
- **URL**: `/test`
- **Request Headers**: None
- **Request Body**: None
- **Response**:
  - **Status Code**: 200 OK
  - **Body**:
    ```json
    {
      "success": true,
      "data": {
        "api": "api/v1/file/test",
        "status": "UP"
      },
      "message": "Test endpoint is up",
      "status": "OK"
    }
    ```
- **Example**:
  ```bash
  curl -X GET http://<base-url>/api/v1/file/test
  ```

### 2. Upload File
- **Description**: Uploads a file to the specified type (images or cvs) in the Supabase storage bucket.
- **Method**: POST
- **URL**: `/upload/{type}`
- **Path Parameters**:
  - `type` (string, required): File type. Must be `images` or `cvs`.
- **Request Headers**:
  - `Content-Type`: multipart/form-data
- **Request Body**:
  - `file` (multipart file, required): The file to upload.
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": "<public-url-of-uploaded-file>",
      "message": "File uploaded successfully",
      "status": "OK"
    }
    ```
  - **Error (400 Bad Request)**:
    ```json
    {
      "success": false,
      "data": null,
      "message": "Invalid type: must be 'images' or 'cvs'",
      "status": "BAD_REQUEST"
    }
    ```
    or
    ```json
    {
      "success": false,
      "data": null,
      "message": "Upload failed: <error-message>",
      "status": "BAD_REQUEST"
    }
    ```
- **Example**:
  ```bash
  curl -X POST http://<base-url>/api/v1/file/upload/images \
       -F "file=@/path/to/image.jpg" \
       -H "Content-Type: multipart/form-data"
  ```

### 3. List Files
- **Description**: Lists all files of the specified type (images or cvs) in the Supabase storage bucket. Requires admin access.
- **Method**: GET
- **URL**: `/list/{type}`
- **Path Parameters**:
  - `type` (string, required): File type. Must be `images` or `cvs`.
- **Request Headers**:
  - `X-Role` (string, required): Must be `ADMIN`.
- **Request Body**: None
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": [
        "<public-url-of-file-1>",
        "<public-url-of-file-2>"
      ],
      "message": "Files listed successfully",
      "status": "OK"
    }
    ```
  - **Error (400 Bad Request)**:
    ```json
    {
      "success": false,
      "data": null,
      "message": "Invalid type: must be 'images' or 'cvs'",
      "status": "BAD_REQUEST"
    }
    ```
  - **Error (403 Forbidden)**:
    ```json
    {
      "success": false,
      "data": null,
      "message": "Admin access required",
      "status": "FORBIDDEN"
    }
    ```
  - **Error (500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "data": null,
      "message": "List failed: <error-message>",
      "status": "INTERNAL_SERVER_ERROR"
    }
    ```
- **Example**:
  ```bash
  curl -X GET http://<base-url>/api/v1/file/list/images \
       -H "X-Role: ADMIN"
  ```

### 4. Delete File
- **Description**: Deletes a specific file of the specified type (images or cvs) from the Supabase storage bucket. Requires admin access.
- **Method**: DELETE
- **URL**: `/delete/{type}/{filename}`
- **Path Parameters**:
  - `type` (string, required): File type. Must be `images` or `cvs`.
  - `filename` (string, required): Name of the file to delete.
- **Request Headers**:
  - `X-Role` (string, required): Must be `ADMIN`.
- **Request Body**: None
- **Response**:
  - **Success (200 OK)**:
    ```json
    {
      "success": true,
      "data": "File deleted successfully",
      "message": "File deleted successfully",
      "status": "OK"
    }
    ```
  - **Error (400 Bad Request)**:
    ```json
    {
      "success": false,
      "data": null,
      "message": "Invalid type: must be 'images' or 'cvs'",
      "status": "BAD_REQUEST"
    }
    ```
    or
    ```json
    {
      "success": false,
      "data": null,
      "message": "Deletion failed: <error-message>",
      "status": "BAD_REQUEST"
    }
    ```
  - **Error (403 Forbidden)**:
    ```json
    {
      "success": false,
      "data": null,
      "message": "Admin access required",
      "status": "FORBIDDEN"
    }
    ```
- **Example**:
  ```bash
  curl -X DELETE http://<base-url>/api/v1/file/delete/images/sample.jpg \
       -H "X-Role: ADMIN"
  ```

## Error Handling
- All responses use the `ApiResponse` format.
- Common HTTP status codes:
  - `200 OK`: Successful operation.
  - `400 Bad Request`: Invalid input or parameters.
  - `403 Forbidden`: Missing admin role (`X-Role: ADMIN`).
  - `500 Internal Server Error`: Unexpected server error.

## Authentication
- `/list/{type}` and `/delete/{type}/{filename}` require the `X-Role: ADMIN` header.
- `/upload/{type}` does not require authentication.

## Notes
- The API interacts with a Supabase storage bucket, configured via `supabase.url`, `supabase.key`, and `supabase.bucket` properties.
- File uploads append a UUID to the filename to prevent conflicts.
- Supported file types: `images` and `cvs`.
- File uploads use `multipart/form-data`.
- The `ApiResponse` class ensures consistent response structure across all endpoints.