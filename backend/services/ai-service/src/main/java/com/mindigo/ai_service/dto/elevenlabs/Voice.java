package com.mindigo.ai_service.dto.elevenlabs;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashMap;
import java.util.Map;

// Voice DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Voice {
    @JsonProperty("voice_id")
    private String voiceId;

    private String name;
    private String category;
    private String description;

    @JsonProperty("preview_url")
    private String previewUrl;

    private Map<String, String> labels = new HashMap<>();
    private VoiceSettings settings;
}