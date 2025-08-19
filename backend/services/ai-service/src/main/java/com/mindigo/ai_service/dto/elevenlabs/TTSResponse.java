package com.mindigo.ai_service.dto.elevenlabs;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TTSResponse {
    private String audioUrl;
    private String filename;
    private String voiceId;
    private String voiceName;
    private String format;
    private Long sizeBytes;
}