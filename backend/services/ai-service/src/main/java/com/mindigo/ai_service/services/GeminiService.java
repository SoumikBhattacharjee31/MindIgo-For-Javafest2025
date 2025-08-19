package com.mindigo.ai_service.services;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.mindigo.ai_service.dto.gemini.GeminiTextRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.text.model}")
    private String textModel;

    @Value("${gemini.api.key}")
    private String apiKey;

    public String sendTextToGemini(GeminiTextRequest request) throws IllegalArgumentException, IOException, RuntimeException {
        final Client client = Client.builder().apiKey(apiKey).build();
        if (request.getSystemInstructions() == null || request.getSystemInstructions().isEmpty()) {
            throw new IllegalArgumentException("System instructions cannot be null or empty");
        }
        if (request.getTexts() == null || request.getTexts().isEmpty()) {
            throw new IllegalArgumentException("Texts cannot be null or empty");
        }

        List<Part> partsOfInstruction = request.getSystemInstructions().stream()
                .map(instruction -> Part.builder().text(instruction).build())
                .toList();

        Content systemInstruction = Content.builder().parts(partsOfInstruction).build();

        List<Part> partsOfTexts = request.getTexts().stream()
                .map(text -> Part.builder().text(text).build())
                .toList();

        Content text = Content.builder().parts(partsOfTexts).build();

        GenerateContentConfig config = GenerateContentConfig.builder().systemInstruction(systemInstruction).build();

        try {
            GenerateContentResponse response = client.models.generateContent(textModel, text, config);
            return response.text();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid request parameters for Gemini API", e);
        } catch (RuntimeException e) {
            throw new RuntimeException("Unexpected error from Gemini API", e);
        }
    }
}