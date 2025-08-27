package com.mindigo.ai_service.repositories;

import com.mindigo.ai_service.dto.PagedResult;
import com.mindigo.ai_service.dto.elevenlabs.Voice;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class VoiceRepository {
    private final Map<String, Voice> voicesById = new ConcurrentHashMap<>();
    private final Map<String, List<Voice>> voicesByCategory = new ConcurrentHashMap<>();
    private final List<Voice> sortedVoices = Collections.synchronizedList(new ArrayList<>());
    private volatile int totalCount = 0;

    public void updateVoices(List<Voice> voices) {
        synchronized (this) {
            // Clear existing data
            voicesById.clear();
            voicesByCategory.clear();
            sortedVoices.clear();

            // Populate maps for efficient access
            voices.forEach(voice -> {
                voicesById.put(voice.getVoiceId(), voice);
                String category = voice.getCategory() != null ? voice.getCategory() : "Other";
                voicesByCategory.computeIfAbsent(category, k -> new ArrayList<>()).add(voice);
            });

            // Sort voices by name for consistent pagination
            sortedVoices.addAll(voices);
            sortedVoices.sort(Comparator.comparing(Voice::getName));

            this.totalCount = voices.size();
        }

        log.info("Voice repository updated with {} voices in {} categories",
                totalCount, voicesByCategory.size());
    }

    public PagedResult<Voice> getVoicesPaged(int page, int size) {
        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException("Invalid pagination parameters");
        }

        int start = page * size;
        int end = Math.min(start + size, sortedVoices.size());

        List<Voice> pageData = (start >= sortedVoices.size())
                ? Collections.emptyList()
                : new ArrayList<>(sortedVoices.subList(start, end));

        return PagedResult.<Voice>builder()
                .content(pageData)
                .page(page)
                .size(size)
                .totalElements(totalCount)
                .totalPages((int) Math.ceil((double) totalCount / size))
                .hasNext(end < totalCount)
                .hasPrevious(page > 0)
                .build();
    }

    public Optional<Voice> findById(String voiceId) {
        return Optional.ofNullable(voicesById.get(voiceId));
    }

    public PagedResult<Voice> getVoicesByCategoryPaged(String category, int page, int size) {
        List<Voice> categoryVoices = voicesByCategory.getOrDefault(category, Collections.emptyList());

        int start = page * size;
        int end = Math.min(start + size, categoryVoices.size());

        List<Voice> pageData = (start >= categoryVoices.size())
                ? Collections.emptyList()
                : new ArrayList<>(categoryVoices.subList(start, end));

        return PagedResult.<Voice>builder()
                .content(pageData)
                .page(page)
                .size(size)
                .totalElements(categoryVoices.size())
                .totalPages((int) Math.ceil((double) categoryVoices.size() / size))
                .hasNext(end < categoryVoices.size())
                .hasPrevious(page > 0)
                .build();
    }

    public Set<String> getAvailableCategories() {
        return new HashSet<>(voicesByCategory.keySet());
    }

    public int getTotalCount() {
        return totalCount;
    }

    public boolean isEmpty() {
        return totalCount == 0;
    }
}
