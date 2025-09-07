package com.mindigo.appointment_service.service;

import com.mindigo.appointment_service.dto.request.CounselorSettingsRequest;
import com.mindigo.appointment_service.dto.response.*;
import com.mindigo.appointment_service.entity.CounselorSettings;
import com.mindigo.appointment_service.repository.CounselorSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CounselorService {

    private final CounselorSettingsRepository settingsRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public CounselorSettingsResponse updateSettings(CounselorSettingsRequest request,
                                                    Long counselorId, String counselorEmail) {
        CounselorSettings settings = settingsRepository.findByCounselorId(counselorId)
                .orElse(CounselorSettings.builder()
                        .counselorId(counselorId)
                        .counselorEmail(counselorEmail)
                        .build());

        if (request.getMaxBookingDays() != null) {
            settings.setMaxBookingDays(request.getMaxBookingDays());
        }
        if (request.getDefaultSlotDurationMinutes() != null) {
            settings.setDefaultSlotDurationMinutes(request.getDefaultSlotDurationMinutes());
        }
        if (request.getAutoAcceptAppointments() != null) {
            settings.setAutoAcceptAppointments(request.getAutoAcceptAppointments());
        }

        settings = settingsRepository.save(settings);

        return mapToSettingsResponse(settings);
    }

    public CounselorSettingsResponse getSettings(Long counselorId) {
        CounselorSettings settings = settingsRepository.findByCounselorId(counselorId)
                .orElse(CounselorSettings.builder()
                        .counselorId(counselorId)
                        .maxBookingDays(10)
                        .defaultSlotDurationMinutes(60)
                        .autoAcceptAppointments(false)
                        .build());

        return mapToSettingsResponse(settings);
    }

    public List<CounselorResponse> getApprovedCounselors() {
        try {
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/counselors";
            ResponseEntity<ApiResponseClass> response = restTemplate.getForEntity(authServiceUrl, ApiResponseClass.class);

            if (response.getBody() != null && response.getBody().isSuccess()) {
                List<Map<String, Object>> counselorsData = (List<Map<String, Object>>) response.getBody().getData();

                return counselorsData.stream()
                        .map(userData -> CounselorResponse.builder()
                                .id(Long.valueOf(userData.get("id").toString()))
                                .name((String) userData.get("name"))
                                .email((String) userData.get("email"))
                                .profileImageUrl((String) userData.get("profileImageUrl"))
                                .build())
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("Error fetching approved counselors: {}", e.getMessage());
        }

        return List.of();
    }

    private CounselorSettingsResponse mapToSettingsResponse(CounselorSettings settings) {
        return CounselorSettingsResponse.builder()
                .maxBookingDays(settings.getMaxBookingDays())
                .defaultSlotDurationMinutes(settings.getDefaultSlotDurationMinutes())
                .autoAcceptAppointments(settings.getAutoAcceptAppointments())
                .build();
    }
}