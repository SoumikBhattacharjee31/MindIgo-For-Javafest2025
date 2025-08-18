package com.mindigo.content_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PagedTaskResponse {
    private List<TaskResponse> tasks;
    private int size;
    private int page;
    private long totalElements;
    private int totalPages;
}
