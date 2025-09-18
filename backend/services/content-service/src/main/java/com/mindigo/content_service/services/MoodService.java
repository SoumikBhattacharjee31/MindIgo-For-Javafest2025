package com.mindigo.content_service.services;

import com.mindigo.content_service.dto.mood.MoodRequest;
import com.mindigo.content_service.dto.mood.MoodResponse;
import com.mindigo.content_service.models.mood.Mood;
import com.mindigo.content_service.models.mood.MoodType;
import com.mindigo.content_service.repositories.MoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MoodService {
    private final MoodRepository moodRepository;

    public List<MoodResponse> getMoods(Long userId, int days, LocalDate today) {
        if (today == null) {
            throw new IllegalArgumentException("today field should not be empty");
        }

        LocalDate offset = today.minusDays(days - 1);

        List<Mood> moods = moodRepository.findByUserIdAndDateBetween(userId, offset, today);


        if (moods == null || moods.isEmpty()) {
            return Collections.emptyList();
        }
        moods = moods.stream()
                .sorted(Comparator.comparing(Mood::getDate))
                .toList();

        return moods.stream()
                .map(mood -> MoodResponse.builder()
                        .mood(mood.getMood().toString() )
                        .date(mood.getDate())
                        .description(mood.getDescription())
                        .reason(mood.getReason())
                        .build())
                .toList();
    }

    @Transactional
    public MoodResponse setMoods(Long userId, MoodRequest request) {
        if (request == null || request.getMood() == null || request.getDate() == null) {
            throw new IllegalArgumentException("Mood request or mood type cannot be null");
        }

        Mood mood = moodRepository.findByUserIdAndDate(userId, request.getDate())
                .orElseGet(() -> Mood.builder()
                        .userId(userId)
                        .date(request.getDate())
                        .build());

        if (!validateEnum(request.getMood())) {
            throw new IllegalArgumentException("Invalid mood type");
        }

        mood.setMood(MoodType.valueOf(request.getMood().toUpperCase()));
        mood.setDescription(request.getDescription());
        mood.setReason(request.getReason());

        Mood saved = moodRepository.save(mood);

        return MoodResponse.builder()
                .mood(saved.getMood().toString())
                .date(saved.getDate())
                .description(saved.getDescription())
                .reason(saved.getReason())
                .build();
    }

    private Boolean validateEnum(String mood) {
        if (mood == null) {
            return false;
        }
        try {
            MoodType.valueOf(mood.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
