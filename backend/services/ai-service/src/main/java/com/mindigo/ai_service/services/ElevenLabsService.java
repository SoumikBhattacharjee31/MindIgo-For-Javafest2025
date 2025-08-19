package com.mindigo.ai_service.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindigo.ai_service.dto.elevenlabs.*;
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
import java.util.concurrent.ConcurrentHashMap;
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

    private final Map<String, Voice> voicesCache = new ConcurrentHashMap<>();
    private final List<Voice> voicesList = Collections.synchronizedList(new ArrayList<>());

    @PostConstruct
    public void initialize() {
        try {
            loadFromJson();
            if (voicesCache.isEmpty()) {
                fetchAndSaveVoices();
            }
            log.info("ElevenLabsService initialized with {} voices from file", voicesCache.size());
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
                    synchronized (this) {
                        voicesCache.clear();
                        voicesList.clear();
                        response.getVoices().forEach(voice -> {
                            voicesCache.put(voice.getVoiceId(), voice);
                            voicesList.add(voice);
                        });
                    }
                    log.info("Loaded {} voices from JSON file", voicesCache.size());
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

                synchronized (this) {
                    voicesCache.clear();
                    voicesList.clear();
                    voices.forEach(voice -> {
                        voicesCache.put(voice.getVoiceId(), voice);
                        voicesList.add(voice);
                    });
                }

                // Save to JSON
                VoicesResponse saveResponse = new VoicesResponse();
                saveResponse.setVoices(new ArrayList<>(voicesList));
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

    public List<Voice> getVoices() {
        return new ArrayList<>(voicesList);
    }

    public Optional<Voice> getVoiceById(String voiceId) {
        return Optional.ofNullable(voicesCache.get(voiceId));
    }

    public CategorizedVoices getVoicesByCategory() {
        Map<String, List<Voice>> categories = voicesList.stream()
                .collect(Collectors.groupingBy(
                        voice -> voice.getCategory() != null ? voice.getCategory() : "Other"
                ));

        List<String> availableCategories = new ArrayList<>(categories.keySet());
        Collections.sort(availableCategories);

        return CategorizedVoices.builder()
                .categories(categories)
                .totalVoices(voicesList.size())
                .availableCategories(availableCategories)
                .build();
    }

    public List<VoiceOption> getVoiceOptions() {
        return voicesList.stream()
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

    public byte[] textToSpeech(TTSRequest request) {
        if (!voicesCache.containsKey(request.getVoiceId())) {
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

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("xi-api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}


//package com.mindigo.ai_service.services;
//
//import com.mindigo.ai_service.dto.*;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.client.HttpClientErrorException;
//
//import jakarta.annotation.PostConstruct;
//import java.time.LocalDateTime;
//import java.util.*;
//import java.util.concurrent.ConcurrentHashMap;
//import java.util.stream.Collectors;
//
//@Service
//@Slf4j
//@RequiredArgsConstructor
//public class ElevenLabsService {
//
//    @Value("${elevenlabs_api_key}")
//    private String apiKey;
//
//    @Value("${elevenlabs_api_base_url}")
//    private String baseUrl;
//
//    @Value("${elevenlabs_api_model_id}")
//    private String modelId;
//
//    @Value("${elevenlabs.cache.expiry-hours:24}")
//    private long cacheExpiryHours;
//
//    private final RestTemplate restTemplate;
//    private final Map<String, Voice> voicesCache = new ConcurrentHashMap<>();
//    private final List<Voice> voicesList = Collections.synchronizedList(new ArrayList<>());
//    private volatile LocalDateTime lastVoicesFetch;
//
//
//    @PostConstruct
//    public void initialize() {
//        try {
//            fetchAndCacheVoices();
//            log.info("ElevenLabsService initialized with {} voices", voicesCache.size());
//        } catch (Exception e) {
//            log.error("Failed to initialize ElevenLabsService", e);
//        }
//    }
//
//    private void fetchAndCacheVoices() {
//        try {
//            HttpHeaders headers = createHeaders();
//            HttpEntity<String> entity = new HttpEntity<>(headers);
//
//            ResponseEntity<VoicesResponse> response = restTemplate.exchange(
//                    baseUrl + "/v1/voices",
//                    HttpMethod.GET,
//                    entity,
//                    VoicesResponse.class
//            );
//
//            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
//                List<Voice> voices = response.getBody().getVoices();
//
//                synchronized (this) {
//                    voicesCache.clear();
//                    voicesList.clear();
//
//                    voices.forEach(voice -> {
//                        voicesCache.put(voice.getVoiceId(), voice);
//                        voicesList.add(voice);
//                    });
//
//                    lastVoicesFetch = LocalDateTime.now();
//                }
//
//                log.info("Successfully cached {} voices. Memory usage: ~{}KB",
//                        voices.size(), estimateCacheSize());
//            }
//        } catch (HttpClientErrorException e) {
//            log.error("HTTP error fetching voices: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
//            throw new RuntimeException("Failed to fetch voices from ElevenLabs API", e);
//        } catch (Exception e) {
//            log.error("Error fetching voices", e);
//            throw new RuntimeException("Failed to fetch voices", e);
//        }
//    }
//
//    public List<Voice> getVoices() {
//        refreshCacheIfNeeded();
//        return new ArrayList<>(voicesList);
//    }
//
//    public Optional<Voice> getVoiceById(String voiceId) {
//        refreshCacheIfNeeded();
//        return Optional.ofNullable(voicesCache.get(voiceId));
//    }
//
//    public CategorizedVoices getVoicesByCategory() {
//        refreshCacheIfNeeded();
//
//        Map<String, List<Voice>> categories = voicesList.stream()
//                .collect(Collectors.groupingBy(
//                        voice -> voice.getCategory() != null ? voice.getCategory() : "Other"
//                ));
//
//        List<String> availableCategories = new ArrayList<>(categories.keySet());
//        Collections.sort(availableCategories);
//
//        return CategorizedVoices.builder()
//                .categories(categories)
//                .totalVoices(voicesList.size())
//                .availableCategories(availableCategories)
//                .build();
//    }
//
//
//    public List<VoiceOption> getVoiceOptions() {
//        refreshCacheIfNeeded();
//        return voicesList.stream()
//                .map(voice -> VoiceOption.builder()
//                        .voiceId(voice.getVoiceId())
//                        .label(voice.getName())
//                        .category(voice.getCategory() != null ? voice.getCategory() : "Other")
//                        .description(voice.getDescription())
//                        .previewUrl(voice.getPreviewUrl())
//                        .build())
//                .sorted(Comparator.comparing(VoiceOption::getCategory)
//                        .thenComparing(VoiceOption::getLabel))
//                .collect(Collectors.toList());
//    }
//
//    public byte[] textToSpeech(TTSRequest request) {
//        if (!voicesCache.containsKey(request.getVoiceId())) {
//            throw new IllegalArgumentException("Voice with ID " + request.getVoiceId() + " not found");
//        }
//
//        try {
//            HttpHeaders headers = createHeaders();
//
//            Map<String, Object> requestBody = new HashMap<>();
//            requestBody.put("text", request.getText());
//            requestBody.put("model_id", modelId);
//
//            if (request.getVoiceSettings() != null) {
//                requestBody.put("voice_settings", request.getVoiceSettings());
//            }
//
//            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
//
//            String url = String.format("%s/v1/text-to-speech/%s?output_format=%s",
//                    baseUrl, request.getVoiceId(), request.getOutputFormat());
//
//            ResponseEntity<byte[]> response = restTemplate.exchange(
//                    url,
//                    HttpMethod.POST,
//                    entity,
//                    byte[].class
//            );
//
//            if (response.getStatusCode() == HttpStatus.OK) {
//                byte[] audioData = response.getBody();
//                log.info("Generated TTS audio: {} bytes for voice {}",
//                        audioData != null ? audioData.length : 0, request.getVoiceId());
//                return audioData;
//            } else {
//                throw new RuntimeException("TTS request failed with status: " + response.getStatusCode());
//            }
//
//        } catch (HttpClientErrorException e) {
//            log.error("HTTP error in TTS: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
//            throw new RuntimeException("Text-to-speech conversion failed: " + e.getMessage(), e);
//        } catch (Exception e) {
//            log.error("Error in text-to-speech conversion", e);
//            throw new RuntimeException("Text-to-speech conversion failed", e);
//        }
//    }
//
//    private void refreshCacheIfNeeded() {
//        if (shouldRefreshCache()) {
//            log.info("Refreshing expired voices cache");
//            try {
//                fetchAndCacheVoices();
//            } catch (Exception e) {
//                log.warn("Failed to refresh cache, using stale data", e);
//            }
//        }
//    }
//
//    private boolean shouldRefreshCache() {
//        return lastVoicesFetch == null ||
//                voicesCache.isEmpty() ||
//                lastVoicesFetch.isBefore(LocalDateTime.now().minusHours(cacheExpiryHours));
//    }
//
//    private HttpHeaders createHeaders() {
//        HttpHeaders headers = new HttpHeaders();
//        headers.set("xi-api-key", apiKey);
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        return headers;
//    }
//
//    private long estimateCacheSize() {
//        return voicesCache.size() * 1500L / 1024; // KB
//    }
//}