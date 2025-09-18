package com.mindigo.content_service.config;

import com.mindigo.content_service.models.sleep.SleepData;
import com.mindigo.content_service.repositories.SleepDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Random;

@Configuration
public class MockSleepData {
    private static final Logger logger = LoggerFactory.getLogger(MockSleepData.class);
    private final Random random = new Random();

    @Bean
    CommandLineRunner initSleepData(SleepDataRepository repository) {
        return args -> {
            Long userId = 1L;
            LocalDate today = LocalDate.now();

            for (int i = 0; i < 7; i++) {
                LocalDate date = today.minusDays(i);

                repository.findByUserIdAndDate(userId, date).ifPresentOrElse(
                        existing -> {},
                        () -> {
                            LocalTime sleepTime = generateRandomSleepTime();
                            LocalTime wakeTime = generateRandomWakeTime(sleepTime);

                            SleepData sleepData = new SleepData(
                                    null,
                                    userId,
                                    date,
                                    sleepTime,
                                    wakeTime
                            );

                            repository.save(sleepData);
                            logger.info("Inserted mock sleep data for {}", date);
                        }
                );
            }
        };
    }

    private LocalTime generateRandomSleepTime() {
        int hour = 22 + random.nextInt(4);
        if (hour >= 24) hour -= 24;
        int minute = random.nextInt(60);
        return LocalTime.of(hour, minute);
    }

    private LocalTime generateRandomWakeTime(LocalTime sleepTime) {
        int addHours = 6 + random.nextInt(4);
        return sleepTime.plusHours(addHours).withMinute(random.nextInt(60));
    }
}
