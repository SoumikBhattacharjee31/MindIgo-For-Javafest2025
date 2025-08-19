package com.mindigo.content_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskOrderItem {

    @NotNull(message = "Task ID is mandatory")
    private Long taskId;

    @NotNull(message = "Order index is mandatory")
    @Min(value = 0, message = "Order index must be non-negative")
    private Integer orderIndex;
}