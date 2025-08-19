package com.mindigo.ai_service.dto.elevenlabs;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TTSRequest {
    @NotBlank(message = "Text is required")
    @Size(max = 5000, message = "Text must not exceed 5000 characters")
    private String text;

    @NotBlank(message = "Voice ID is required")
    private String voiceId;

    @JsonProperty("voice_settings")
    private VoiceSettings voiceSettings;

    @Builder.Default
    private String outputFormat = "mp3_44100_128";

    @Builder.Default
    private String fileName = "text-to-speech";
}