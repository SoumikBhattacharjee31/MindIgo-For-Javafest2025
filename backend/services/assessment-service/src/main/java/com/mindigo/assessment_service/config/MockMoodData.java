package com.mindigo.assessment_service.config;

import com.mindigo.assessment_service.models.Mood;
import com.mindigo.assessment_service.models.MoodType;
import com.mindigo.assessment_service.repositories.MoodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Configuration
public class MockMoodData {

    @Bean
    public CommandLineRunner initDatabase(MoodRepository moodRepository) {
        Long userId = 1L;

        return args -> {
            LocalDate today = LocalDate.now();

            List<MoodType> moodTypes = List.of(
                    MoodType.HAPPY, MoodType.SAD, MoodType.TERRIBLE, MoodType.AMAZING
            );

            Map<MoodType, String> reasons = Map.of(
                    MoodType.HAPPY, "Had a productive day.",
                    MoodType.SAD, "Had a rough night.",
                    MoodType.TERRIBLE, "Everything went wrong.",
                    MoodType.AMAZING, "Had an amazing day."
            );

            Map<MoodType, String> descriptions = Map.of(
                    MoodType.HAPPY, "Feeling great!",
                    MoodType.SAD, "Feeling down.",
                    MoodType.TERRIBLE, "Feeling awful.",
                    MoodType.AMAZING, "Feeling awesome!"
            );

            List<Mood> newMoods = new ArrayList<>();

            for (int i = 0; i < 14; i++) {
                LocalDate date = today.minusDays(i);

                boolean exists = moodRepository.existsByUserIdAndDate(userId, date);
                if (!exists) {
                    MoodType moodType = moodTypes.get(ThreadLocalRandom.current().nextInt(moodTypes.size()));

                    newMoods.add(
                            Mood.builder()
                                    .userId(userId)
                                    .date(date)
                                    .mood(moodType)
                                    .description(descriptions.get(moodType))
                                    .reason(reasons.get(moodType))
                                    .build()
                    );
                }
            }

            if (!newMoods.isEmpty()) {
                moodRepository.saveAll(newMoods);
                System.out.println("✅ Mood data initialized for " + newMoods.size() + " missing days!");
            } else {
                System.out.println("ℹ️ All mood data already exists for the past 14 days.");
            }
        };
    }
}
