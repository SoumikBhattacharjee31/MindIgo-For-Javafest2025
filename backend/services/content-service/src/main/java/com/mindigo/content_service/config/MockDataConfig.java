package com.mindigo.content_service.config;

import com.mindigo.content_service.models.breathing.BreathingExercise;
import com.mindigo.content_service.models.breathing.BreathingTask;
import com.mindigo.content_service.models.breathing.BreathingType;
import com.mindigo.content_service.models.breathing.Cycle;
import com.mindigo.content_service.repositories.breathing.BreathingExerciseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class MockDataConfig {
    private static final Logger logger = LoggerFactory.getLogger(MockDataConfig.class);

    @Bean
    public CommandLineRunner initBreathingData(BreathingExerciseRepository breathingExerciseRepository) {
        return args -> {
            if(breathingExerciseRepository.count() != 0)
                return;

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

            List<BreathingTask> boxTasks = List.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(4).cycle(boxCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(4).cycle(boxCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(4).cycle(boxCycle).build(),
                    BreathingTask.builder().order(4).type(BreathingType.HOLD).duration(4).cycle(boxCycle).build()
            );
            boxCycle.setBreathingTasks(boxTasks);
            box.setCycle(boxCycle);

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

            List<BreathingTask> longExhaleTasks = List.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(4).cycle(longExhaleCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(7).cycle(longExhaleCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(8).cycle(longExhaleCycle).build()
            );
            longExhaleCycle.setBreathingTasks(longExhaleTasks);
            longExhale.setCycle(longExhaleCycle);

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

            List<BreathingTask> equalTasks = List.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(5).cycle(equalCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(0).cycle(equalCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(5).cycle(equalCycle).build()
            );
            equalCycle.setBreathingTasks(equalTasks);
            equal.setCycle(equalCycle);

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

            List<BreathingTask> customTasks = List.of(
                    BreathingTask.builder().order(1).type(BreathingType.INHALE).duration(3).cycle(customCycle).build(),
                    BreathingTask.builder().order(2).type(BreathingType.HOLD).duration(2).cycle(customCycle).build(),
                    BreathingTask.builder().order(3).type(BreathingType.EXHALE).duration(5).cycle(customCycle).build()
            );
            customCycle.setBreathingTasks(customTasks);
            custom.setCycle(customCycle);

            logger.info("Four basic breathings are incorporated");
            breathingExerciseRepository.saveAll(List.of(box, longExhale, equal, custom));
        };
    }

}
