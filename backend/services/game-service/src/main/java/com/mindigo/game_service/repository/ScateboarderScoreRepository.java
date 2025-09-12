package com.mindigo.game_service.repository;

import com.mindigo.game_service.entity.ScateboarderScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScateboarderScoreRepository extends JpaRepository<ScateboarderScore, Long> {

    @Query("SELECT s FROM ScateboarderScore s ORDER BY s.score DESC LIMIT 10")
    List<ScateboarderScore> findTop10ByOrderByScoreDesc();

    @Query("SELECT s FROM ScateboarderScore s WHERE s.playerId = :playerId ORDER BY s.score DESC LIMIT 1")
    Optional<ScateboarderScore> findPersonalBestByPlayerId(@Param("playerId") String playerId);

    @Query("SELECT s FROM ScateboarderScore s WHERE s.playerId = :playerId ORDER BY s.score DESC")
    List<ScateboarderScore> findAllByPlayerIdOrderByScoreDesc(@Param("playerId") String playerId);
}