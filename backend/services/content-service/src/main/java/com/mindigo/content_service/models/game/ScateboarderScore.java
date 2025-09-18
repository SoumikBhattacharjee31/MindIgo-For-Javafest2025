package com.mindigo.content_service.models.game;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "scate_boarder_score")
public class ScateboarderScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerId;
    private String playerName;
    private int score;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ScateboarderScore(String playerId, String playerName, int score, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.score = score;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}