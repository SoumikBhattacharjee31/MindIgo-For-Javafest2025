package com.mindigo.content_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PackageRequest {
    private String name;
    private String description;
    private Double price;
    private Boolean free;
}
