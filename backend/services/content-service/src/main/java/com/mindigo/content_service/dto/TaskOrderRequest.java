package com.mindigo.content_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Task Order Request DTO for reordering tasks
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskOrderRequest {

    @NotEmpty(message = "Task orders cannot be empty")
    @Valid
    private List<TaskOrderItem> taskOrders;
}