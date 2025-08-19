package com.mindigo.ai_service.dto.elevenlabs;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VoiceSettings {
    private Double stability;

    @JsonProperty("similarity_boost")
    private Double similarityBoost;

    private Double style;

    @JsonProperty("use_speaker_boost")
    private Boolean useSpeakerBoost;
}
