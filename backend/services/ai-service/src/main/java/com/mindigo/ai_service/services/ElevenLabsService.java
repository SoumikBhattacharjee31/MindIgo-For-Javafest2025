package com.mindigo.ai_service.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindigo.ai_service.dto.PagedResult;
import com.mindigo.ai_service.dto.elevenlabs.*;
import com.mindigo.ai_service.repositories.VoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ElevenLabsService {

    @Value("${elevenlabs.api.key}")
    private String apiKey;

    @Value("${elevenlabs.api.baseUrl}")
    private String baseUrl;

    @Value("${elevenlabs.api.modelId}")
    private String modelId;

    @Value("${elevenlabs.voice.fileName}")
    private String VOICES_FILE;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final VoiceRepository voiceRepository;

    @PostConstruct
    public void initialize() {
        try {
            loadFromJson();
            if (voiceRepository.isEmpty()) {
                fetchAndSaveVoices();
            }
            log.info("ElevenLabsService initialized with {} voices", voiceRepository.getTotalCount());
        } catch (Exception e) {
            log.error("Failed to initialize ElevenLabsService", e);
        }
    }

    private void loadFromJson() {
        try {
            File file = new File(VOICES_FILE);
            if (file.exists() && file.length() > 0) {
                VoicesResponse response = objectMapper.readValue(file, VoicesResponse.class);
                if (response != null && response.getVoices() != null) {
                    voiceRepository.updateVoices(response.getVoices());
                    log.info("Loaded {} voices from JSON file", response.getVoices().size());
                }
            } else {
                log.info("No voices JSON file found or empty; will fetch from API");
            }
        } catch (IOException e) {
            log.error("Error loading voices from JSON", e);
        }
    }

    private void fetchAndSaveVoices() {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<VoicesResponse> response = restTemplate.exchange(
                    baseUrl + "/v1/voices",
                    HttpMethod.GET,
                    entity,
                    VoicesResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Voice> voices = response.getBody().getVoices();
                voiceRepository.updateVoices(voices);

                // Save to JSON
                VoicesResponse saveResponse = new VoicesResponse();
                saveResponse.setVoices(voices);
                objectMapper.writeValue(new File(VOICES_FILE), saveResponse);

                log.info("Fetched and saved {} voices to JSON file", voices.size());
            }
        } catch (HttpClientErrorException e) {
            log.error("HTTP error fetching voices: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch voices from ElevenLabs API", e);
        } catch (Exception e) {
            log.error("Error fetching/saving voices", e);
            throw new RuntimeException("Failed to fetch/save voices", e);
        }
    }

    public void refreshVoices() {
        fetchAndSaveVoices();
    }

    // New efficient paginated methods
    public PagedResult<Voice> getVoicesPaged(int page, int size) {
        return voiceRepository.getVoicesPaged(page, size);
    }

    public PagedResult<Voice> getVoicesByCategoryPaged(String category, int page, int size) {
        return voiceRepository.getVoicesByCategoryPaged(category, page, size);
    }

    public Optional<Voice> getVoiceById(String voiceId) {
        return voiceRepository.findById(voiceId);
    }

    public Set<String> getAvailableCategories() {
        return voiceRepository.getAvailableCategories();
    }

    // Legacy methods for backward compatibility (if needed)
    @Deprecated
    public List<Voice> getVoices() {
        return getVoicesPaged(0, Integer.MAX_VALUE).getContent();
    }

    public CategorizedVoices getVoicesByCategory() {
        Map<String, List<Voice>> categories = new HashMap<>();

        // Build categories map from repository
        for (String category : voiceRepository.getAvailableCategories()) {
            PagedResult<Voice> categoryVoices = voiceRepository.getVoicesByCategoryPaged(
                    category, 0, Integer.MAX_VALUE);
            categories.put(category, categoryVoices.getContent());
        }

        List<String> availableCategories = new ArrayList<>(categories.keySet());
        Collections.sort(availableCategories);

        return CategorizedVoices.builder()
                .categories(categories)
                .totalVoices(voiceRepository.getTotalCount())
                .availableCategories(availableCategories)
                .build();
    }

    public List<VoiceOption> getVoiceOptions() {
        // Get all voices and convert to options
        PagedResult<Voice> allVoices = voiceRepository.getVoicesPaged(0, Integer.MAX_VALUE);

        return allVoices.getContent().stream()
                .map(voice -> VoiceOption.builder()
                        .voiceId(voice.getVoiceId())
                        .label(voice.getName())
                        .category(voice.getCategory() != null ? voice.getCategory() : "Other")
                        .description(voice.getDescription())
                        .previewUrl(voice.getPreviewUrl())
                        .build())
                .sorted(Comparator.comparing(VoiceOption::getCategory)
                        .thenComparing(VoiceOption::getLabel))
                .collect(Collectors.toList());
    }

    public PagedResult<VoiceOption> getVoiceOptionsPaged(int page, int size) {
        PagedResult<Voice> voicesPage = voiceRepository.getVoicesPaged(page, size);

        List<VoiceOption> options = voicesPage.getContent().stream()
                .map(voice -> VoiceOption.builder()
                        .voiceId(voice.getVoiceId())
                        .label(voice.getName())
                        .category(voice.getCategory() != null ? voice.getCategory() : "Other")
                        .description(voice.getDescription())
                        .previewUrl(voice.getPreviewUrl())
                        .build())
                .collect(Collectors.toList());

        return PagedResult.<VoiceOption>builder()
                .content(options)
                .page(voicesPage.getPage())
                .size(voicesPage.getSize())
                .totalElements(voicesPage.getTotalElements())
                .totalPages(voicesPage.getTotalPages())
                .hasNext(voicesPage.isHasNext())
                .hasPrevious(voicesPage.isHasPrevious())
                .build();
    }

    public byte[] textToSpeech(TTSRequest request) {
        // Validate voice exists
        if (voiceRepository.findById(request.getVoiceId()).isEmpty()) {
            throw new IllegalArgumentException("Voice with ID " + request.getVoiceId() + " not found");
        }

        try {
            HttpHeaders headers = createHeaders();

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", request.getText());
            requestBody.put("model_id", modelId);

            if (request.getVoiceSettings() != null) {
                requestBody.put("voice_settings", request.getVoiceSettings());
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = String.format("%s/v1/text-to-speech/%s?output_format=%s",
                    baseUrl, request.getVoiceId(), request.getOutputFormat());

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    byte[].class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                byte[] audioData = response.getBody();
                log.info("Generated TTS audio: {} bytes for voice {}",
                        audioData != null ? audioData.length : 0, request.getVoiceId());
                return audioData;
            } else {
                throw new RuntimeException("TTS request failed with status: " + response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            log.error("HTTP error in TTS: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Text-to-speech conversion failed: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error in text-to-speech conversion", e);
            throw new RuntimeException("Text-to-speech conversion failed", e);
        }
    }

    public VoiceStats getVoiceStats() {
        Map<String, Integer> categoryCount = new HashMap<>();

        for (String category : voiceRepository.getAvailableCategories()) {
            PagedResult<Voice> categoryVoices = voiceRepository.getVoicesByCategoryPaged(
                    category, 0, Integer.MAX_VALUE);
            categoryCount.put(category, categoryVoices.getContent().size());
        }

        return VoiceStats.builder()
                .totalVoices(voiceRepository.getTotalCount())
                .totalCategories(voiceRepository.getAvailableCategories().size())
                .categoryBreakdown(categoryCount)
                .lastUpdated(new Date()) // You might want to track this in repository
                .build();
    }

    public List<Voice> searchVoices(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String searchQuery = query.toLowerCase().trim();
        PagedResult<Voice> allVoices = voiceRepository.getVoicesPaged(0, Integer.MAX_VALUE);

        return allVoices.getContent().stream()
                .filter(voice ->
                        voice.getName().toLowerCase().contains(searchQuery) ||
                                (voice.getDescription() != null && voice.getDescription().toLowerCase().contains(searchQuery)) ||
                                (voice.getCategory() != null && voice.getCategory().toLowerCase().contains(searchQuery))
                )
                .collect(Collectors.toList());
    }

    public PagedResult<Voice> searchVoicesPaged(String query, int page, int size) {
        List<Voice> searchResults = searchVoices(query);

        int start = page * size;
        int end = Math.min(start + size, searchResults.size());

        List<Voice> pageData = (start >= searchResults.size())
                ? Collections.emptyList()
                : searchResults.subList(start, end);

        return PagedResult.<Voice>builder()
                .content(pageData)
                .page(page)
                .size(size)
                .totalElements(searchResults.size())
                .totalPages((int) Math.ceil((double) searchResults.size() / size))
                .hasNext(end < searchResults.size())
                .hasPrevious(page > 0)
                .build();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    // Health check method
    public boolean isHealthy() {
        return !voiceRepository.isEmpty();
    }

    // Get repository status for monitoring
    public Map<String, Object> getRepositoryStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("totalVoices", voiceRepository.getTotalCount());
        status.put("categoriesCount", voiceRepository.getAvailableCategories().size());
        status.put("categories", voiceRepository.getAvailableCategories());
        status.put("isEmpty", voiceRepository.isEmpty());
        return status;
    }
}