package com.mindigo.ai_service.dto.elevenlabs;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategorizedVoices {
    private Map<String, List<Voice>> categories;
    private Integer totalVoices;
    private List<String> availableCategories;
}