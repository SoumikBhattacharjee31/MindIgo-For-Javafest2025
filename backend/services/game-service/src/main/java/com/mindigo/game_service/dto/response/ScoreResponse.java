package com.mindigo.game_service.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreResponse {
    private Long id;
    private String playerId;
    private String playerName;
    private int score;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}