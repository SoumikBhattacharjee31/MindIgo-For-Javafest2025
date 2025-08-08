package com.mindigo.content_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class PagedPackageResponse {
    private List<PackageResponse> packages;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
