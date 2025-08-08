package com.mindigo.content_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PackageResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Boolean free;
    private Boolean active;
    private Boolean canEdit;
}