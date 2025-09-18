package com.mindigo.admin_service.dto.response;

// Generic response wrapper that includes a 'data' field to match ApiResponseClass
public class AuthServiceDataResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public AuthServiceDataResponse() {}
    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}