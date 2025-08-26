package com.mindigo.assessment_service.config;

import com.mindigo.assessment_service.models.Mood;
import com.mindigo.assessment_service.models.MoodType;
import com.mindigo.assessment_service.repositories.MoodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class MockDataConfig {

    @Bean
    CommandLineRunner initDatabase(MoodRepository moodRepository) {
        return args -> {
            if (moodRepository.count() == 0) {
                List<Mood> moods = List.of(
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-10"))
                                .mood(MoodType.HAPPY).description("Feeling great!").reason("Had a productive day.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-11"))
                                .mood(MoodType.SAD).description("Feeling down.").reason("Had a rough night.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-12"))
                                .mood(MoodType.TERRIBLE).description("Feeling awful.").reason("Everything went wrong.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-13"))
                                .mood(MoodType.SAD).description("Feeling down.").reason("Had a rough night.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-14"))
                                .mood(MoodType.SAD).description("Feeling down.").reason("Had a rough night.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-15"))
                                .mood(MoodType.TERRIBLE).description("Feeling awful.").reason("Everything went wrong.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-16"))
                                .mood(MoodType.SAD).description("Feeling down.").reason("Had a rough night.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-17"))
                                .mood(MoodType.SAD).description("Feeling down.").reason("Had a rough night.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-18"))
                                .mood(MoodType.TERRIBLE).description("Feeling awful.").reason("Everything went wrong.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-19"))
                                .mood(MoodType.SAD).description("Feeling down.").reason("Had a rough night.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-20"))
                                .mood(MoodType.HAPPY).description("Feeling great!").reason("Had a productive day.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-21"))
                                .mood(MoodType.AMAZING).description("Feeling awesome!").reason("Had an amazing day.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-22"))
                                .mood(MoodType.HAPPY).description("Feeling great!").reason("Had a productive day.").build(),
                        Mood.builder().userId(3L).date(LocalDate.parse("2025-08-23"))
                                .mood(MoodType.HAPPY).description("Feeling great!").reason("Had a productive day.").build()
                );

                moodRepository.saveAll(moods);
                System.out.println("✅ Mood data initialized!");
            }
        };
    }
}
