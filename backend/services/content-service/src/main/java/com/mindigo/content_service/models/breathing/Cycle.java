package com.mindigo.content_service.models.breathing;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "cycle")
public class Cycle {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NotNull
    @Min(value =  1)
    private Integer duration; //seconds

    @OneToMany(mappedBy = "cycle",cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<BreathingTask> breathingTasks;

}
