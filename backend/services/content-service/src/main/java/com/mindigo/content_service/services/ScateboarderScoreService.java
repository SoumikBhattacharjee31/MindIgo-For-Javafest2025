package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.game.SaveScoreRequest;
import com.mindigo.content_service.dto.ApiResponseClass;
import com.mindigo.content_service.dto.game.ScoreResponse;
import com.mindigo.content_service.dto.game.UserProfileResponse;
import com.mindigo.content_service.models.game.ScateboarderScore;
import com.mindigo.content_service.repositories.ScateboarderScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScateboarderScoreService {

    private final ScateboarderScoreRepository scoreRepository;
    private final RestTemplate restTemplate;

    @Value("${auth.service.url:http://AUTH-SERVICE}")
    private String authServiceUrl;

    public ScoreResponse saveScore(String playerId, SaveScoreRequest request) {
        try {
            // Get player profile from auth service
            UserProfileResponse userProfile = getUserProfile(playerId);
            String playerName = userProfile != null ? userProfile.getName() : "Unknown Player";

            // Create and save score
            ScateboarderScore score = new ScateboarderScore(
                    playerId,
                    playerName,
                    request.getScore(),
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );

            ScateboarderScore savedScore = scoreRepository.save(score);

            return mapToScoreResponse(savedScore);

        } catch (Exception e) {
            log.error("Error saving score for player: {}", playerId, e);
            throw new RuntimeException("Failed to save score: " + e.getMessage());
        }
    }

    public List<ScoreResponse> getTop10Scores() {
        try {
            List<ScateboarderScore> topScores = scoreRepository.findTop10ByOrderByScoreDesc();
            return topScores.stream()
                    .map(this::mapToScoreResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching top 10 scores", e);
            throw new RuntimeException("Failed to fetch top scores: " + e.getMessage());
        }
    }

    public Optional<ScoreResponse> getPersonalBest(String playerId) {
        try {
            Optional<ScateboarderScore> personalBest = scoreRepository.findPersonalBestByPlayerId(playerId);
            return personalBest.map(this::mapToScoreResponse);
        } catch (Exception e) {
            log.error("Error fetching personal best for player: {}", playerId, e);
            throw new RuntimeException("Failed to fetch personal best: " + e.getMessage());
        }
    }

    public List<ScoreResponse> getPlayerScores(String playerId) {
        try {
            List<ScateboarderScore> playerScores = scoreRepository.findAllByPlayerIdOrderByScoreDesc(playerId);
            return playerScores.stream()
                    .map(this::mapToScoreResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching scores for player: {}", playerId, e);
            throw new RuntimeException("Failed to fetch player scores: " + e.getMessage());
        }
    }

    private UserProfileResponse getUserProfile(String userId) {
        try {
            String url = authServiceUrl + "/api/v1/auth/profilebyid/" + userId;
            ResponseEntity<ApiResponseClass> response = restTemplate.getForEntity(url, ApiResponseClass.class);

            if (response.getBody() != null && response.getBody().isSuccess()) {
                Map<String, Object> userData = (Map<String, Object>) response.getBody().getData();
                return UserProfileResponse.builder()
                        .name((String) userData.get("name"))
                        .email((String) userData.get("email"))
                        .profileImageUrl((String) userData.get("profileImageUrl"))
                        .build();
            }

            log.warn("Failed to fetch user profile for userId: {}", userId);
            return null;

        } catch (Exception e) {
            log.error("Error fetching user profile for userId: {}", userId, e);
            return null;
        }
    }

    private ScoreResponse mapToScoreResponse(ScateboarderScore score) {
        return ScoreResponse.builder()
                .id(score.getId())
                .playerId(score.getPlayerId())
                .playerName(score.getPlayerName())
                .score(score.getScore())
                .createdAt(score.getCreatedAt())
                .updatedAt(score.getUpdatedAt())
                .build();
    }
}