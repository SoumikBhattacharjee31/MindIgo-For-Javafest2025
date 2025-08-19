package com.mindigo.ai_service.dto.gemini;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GeminiTextRequest {
    private List<String> texts;
    private List<String> systemInstructions;
}
