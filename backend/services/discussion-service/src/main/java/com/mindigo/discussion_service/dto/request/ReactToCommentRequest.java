package com.mindigo.discussion_service.dto.request;

import com.mindigo.discussion_service.entity.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactToCommentRequest {

    @NotNull(message = "Reaction type is required")
    private ReactionType reactionType;
}