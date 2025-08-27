package com.mindigo.ai_service.dto.elevenlabs;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.Map;

@Data
@Builder
public class VoiceStats {
    private int totalVoices;
    private int totalCategories;
    private Map<String, Integer> categoryBreakdown;
    private Date lastUpdated;
}