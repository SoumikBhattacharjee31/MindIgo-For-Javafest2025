package com.mindigo.content_service.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseRequest {
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    private Long packageId;
}
