package com.mindigo.game_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
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