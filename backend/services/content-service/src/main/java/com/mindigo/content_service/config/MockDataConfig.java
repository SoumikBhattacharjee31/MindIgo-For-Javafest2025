package com.mindigo.content_service.config;

import com.mindigo.content_service.models.BreathingExercise;
import com.mindigo.content_service.models.BreathingTask;
import com.mindigo.content_service.models.BreathingType;
import com.mindigo.content_service.models.Cycle;
import com.mindigo.content_service.repositories.BreathingExerciseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Set;

@Configuration
public class MockDataConfig {
    @Bean
    public CommandLineRunner initDatabase(BreathingExerciseRepository breathingExerciseRepository) {
        return args -> {
            if(breathingExerciseRepository.count() != 0)
                return;
            // --- Exercise 1: Box ---
            BreathingExercise box = BreathingExercise.builder()
                    .title("Box")
                    .description("Relaxation")
                    .pattern("4-4-4-4")
                    .duration(5)
                    .isCustomizable(false)
                    .build();

            Cycle boxCycle = Cycle.builder()
                    .duration(16)
                    .build();

            Set<BreathingTask> boxTasks = Set.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(4).cycle(boxCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(4).cycle(boxCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(4).cycle(boxCycle).build(),
                    BreathingTask.builder().order(4).type(BreathingType.HOLD).duration(4).cycle(boxCycle).build()
            );
            boxCycle.setBreathingTasks(boxTasks);
            box.setCycle(boxCycle);

            // --- Exercise 2: Long exhale ---
            BreathingExercise longExhale = BreathingExercise.builder()
                    .title("Long exhale")
                    .description("Sleep")
                    .pattern("4-7-8")
                    .duration(5)
                    .isCustomizable(false)
                    .build();

            Cycle longExhaleCycle = Cycle.builder()
                    .duration(19)
                    .build();

            Set<BreathingTask> longExhaleTasks = Set.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(4).cycle(longExhaleCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(7).cycle(longExhaleCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(8).cycle(longExhaleCycle).build()
            );
            longExhaleCycle.setBreathingTasks(longExhaleTasks);
            longExhale.setCycle(longExhaleCycle);

            // --- Exercise 3: Equal ---
            BreathingExercise equal = BreathingExercise.builder()
                    .title("Equal")
                    .description("Focus")
                    .pattern("5-0-5")
                    .duration(5)
                    .isCustomizable(false)
                    .build();

            Cycle equalCycle = Cycle.builder()
                    .duration(10)
                    .build();

            Set<BreathingTask> equalTasks = Set.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(5).cycle(equalCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(0).cycle(equalCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(5).cycle(equalCycle).build()
            );
            equalCycle.setBreathingTasks(equalTasks);
            equal.setCycle(equalCycle);

            // --- Exercise 4: Custom ---
            BreathingExercise custom = BreathingExercise.builder()
                    .title("Custom")
                    .description("Personalized")
                    .pattern("3-2-5")
                    .duration(5)
                    .isCustomizable(true)
                    .build();

            Cycle customCycle = Cycle.builder()
                    .duration(10)
                    .build();

            Set<BreathingTask> customTasks = Set.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(3).cycle(customCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(2).cycle(customCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(5).cycle(customCycle).build()
            );
            customCycle.setBreathingTasks(customTasks);
            custom.setCycle(customCycle);

            // Save all — cascade takes care of cycle & tasks
            breathingExerciseRepository.saveAll(List.of(box, longExhale, equal, custom));
        };
    }

}
