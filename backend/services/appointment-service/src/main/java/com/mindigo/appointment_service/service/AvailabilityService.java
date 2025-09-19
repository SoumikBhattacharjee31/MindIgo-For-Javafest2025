package com.mindigo.appointment_service.service;

import com.mindigo.appointment_service.dto.request.*;
import com.mindigo.appointment_service.dto.response.*;
import com.mindigo.appointment_service.entity.*;
import com.mindigo.appointment_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {

    private final CounselorAvailabilityRepository availabilityRepository;
    private final CounselorSettingsRepository settingsRepository;
    private final DateSpecificAvailabilityRepository dateSpecificAvailabilityRepository;

    @Transactional
    public AvailabilityResponse createAvailability(AvailabilityRequest request, Long counselorId, String counselorEmail) {
        // Validate time range
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Check for overlapping availability
        List<CounselorAvailability> overlapping = availabilityRepository.findOverlappingAvailability(
                counselorId, request.getDayOfWeek(), request.getStartTime(), request.getEndTime());

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time range overlaps with existing availability");
        }

        CounselorAvailability availability = CounselorAvailability.builder()
                .counselorId(counselorId)
                .counselorEmail(counselorEmail)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .slotDurationMinutes(request.getSlotDurationMinutes())
                .build();

        availability = availabilityRepository.save(availability);

        return mapToAvailabilityResponse(availability);
    }

    @Transactional
    public DateSpecificAvailabilityResponse createDateSpecificAvailability(
            DateSpecificAvailabilityRequest request, Long counselorId, String counselorEmail) {

        // Validate time range
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Validate date is not in the past
        if (request.getSpecificDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot set availability for past dates");
        }

        // Get counselor settings to check max booking days
        CounselorSettings settings = settingsRepository.findByCounselorId(counselorId)
                .orElse(CounselorSettings.builder()
                        .counselorId(counselorId)
                        .maxBookingDays(10)
                        .build());

        LocalDate maxDate = LocalDate.now().plusDays(settings.getMaxBookingDays());
        if (request.getSpecificDate().isAfter(maxDate)) {
            throw new IllegalArgumentException("Date exceeds maximum booking days: " + settings.getMaxBookingDays());
        }

        // Check for overlapping date-specific availability
        List<DateSpecificAvailability> overlapping = dateSpecificAvailabilityRepository
                .findOverlappingDateSpecificAvailability(counselorId, request.getSpecificDate(),
                        request.getStartTime(), request.getEndTime());

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time range overlaps with existing date-specific availability");
        }

        DateSpecificAvailability dateSpecificAvailability = DateSpecificAvailability.builder()
                .counselorId(counselorId)
                .counselorEmail(counselorEmail)
                .specificDate(request.getSpecificDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type(AvailabilityType.valueOf(request.getType().toUpperCase()))
                .slotDurationMinutes(request.getSlotDurationMinutes())
                .reason(request.getReason())
                .build();

        dateSpecificAvailability = dateSpecificAvailabilityRepository.save(dateSpecificAvailability);

        return mapToDateSpecificAvailabilityResponse(dateSpecificAvailability);
    }

    public List<AvailabilityResponse> getCounselorAvailability(Long counselorId) {
        List<CounselorAvailability> availabilities = availabilityRepository
                .findByCounselorIdAndIsActiveTrue(counselorId);

        return availabilities.stream()
                .map(this::mapToAvailabilityResponse)
                .collect(Collectors.toList());
    }

    public List<DateSpecificAvailabilityResponse> getDateSpecificAvailability(Long counselorId) {
        List<DateSpecificAvailability> dateSpecificAvailabilities = dateSpecificAvailabilityRepository
                .findByCounselorIdAndIsActiveTrue(counselorId);

        return dateSpecificAvailabilities.stream()
                .map(this::mapToDateSpecificAvailabilityResponse)
                .collect(Collectors.toList());
    }

    public List<DateSpecificAvailabilityResponse> getDateSpecificAvailabilityForDate(Long counselorId, LocalDate date) {
        List<DateSpecificAvailability> dateSpecificAvailabilities = dateSpecificAvailabilityRepository
                .findByCounselorIdAndSpecificDateAndIsActiveTrue(counselorId, date);

        return dateSpecificAvailabilities.stream()
                .map(this::mapToDateSpecificAvailabilityResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AvailabilityResponse updateAvailability(Long availabilityId, AvailabilityRequest request,
                                                   Long counselorId) {
        CounselorAvailability availability = availabilityRepository
                .findByIdAndCounselorId(availabilityId, counselorId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found"));

        // Validate time range
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Check for overlapping availability (excluding current one)
        List<CounselorAvailability> overlapping = availabilityRepository
                .findOverlappingAvailability(counselorId, request.getDayOfWeek(),
                        request.getStartTime(), request.getEndTime())
                .stream()
                .filter(avail -> !avail.getId().equals(availabilityId))
                .collect(Collectors.toList());

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time range overlaps with existing availability");
        }

        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setSlotDurationMinutes(request.getSlotDurationMinutes());

        availability = availabilityRepository.save(availability);

        return mapToAvailabilityResponse(availability);
    }

    @Transactional
    public DateSpecificAvailabilityResponse updateDateSpecificAvailability(
            Long availabilityId, DateSpecificAvailabilityRequest request, Long counselorId) {

        DateSpecificAvailability availability = dateSpecificAvailabilityRepository
                .findByIdAndCounselorId(availabilityId, counselorId)
                .orElseThrow(() -> new IllegalArgumentException("Date-specific availability not found"));

        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (!request.getStartTime().isBefore(request.getEndTime())) {
                throw new IllegalArgumentException("Start time must be before end time");
            }
        } else {
            throw new IllegalArgumentException("Both start time and end time are required for this update.");
        }

        // Validate date is not in the past
        if (request.getSpecificDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot set availability for past dates");
        }

        // Check for overlapping date-specific availability (excluding current one)
        List<DateSpecificAvailability> overlapping = dateSpecificAvailabilityRepository
                .findOverlappingDateSpecificAvailability(counselorId, request.getSpecificDate(),
                        request.getStartTime(), request.getEndTime())
                .stream()
                .filter(avail -> !avail.getId().equals(availabilityId))
                .collect(Collectors.toList());

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Time range overlaps with existing date-specific availability");
        }

        availability.setSpecificDate(request.getSpecificDate());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setType(AvailabilityType.valueOf(request.getType().toUpperCase()));
        availability.setSlotDurationMinutes(request.getSlotDurationMinutes());
        availability.setReason(request.getReason());

        availability = dateSpecificAvailabilityRepository.save(availability);

        return mapToDateSpecificAvailabilityResponse(availability);
    }

    @Transactional
    public void deleteAvailability(Long availabilityId, Long counselorId) {
        CounselorAvailability availability = availabilityRepository
                .findByIdAndCounselorId(availabilityId, counselorId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found"));

        availability.setIsActive(false);
        availabilityRepository.save(availability);
    }

    @Transactional
    public void deleteDateSpecificAvailability(Long availabilityId, Long counselorId) {
        DateSpecificAvailability availability = dateSpecificAvailabilityRepository
                .findByIdAndCounselorId(availabilityId, counselorId)
                .orElseThrow(() -> new IllegalArgumentException("Date-specific availability not found"));

        availability.setIsActive(false);
        dateSpecificAvailabilityRepository.save(availability);
    }

    private AvailabilityResponse mapToAvailabilityResponse(CounselorAvailability availability) {
        return AvailabilityResponse.builder()
                .id(availability.getId())
                .dayOfWeek(availability.getDayOfWeek().name())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .slotDurationMinutes(availability.getSlotDurationMinutes())
                .isActive(availability.getIsActive())
                .build();
    }

    private DateSpecificAvailabilityResponse mapToDateSpecificAvailabilityResponse(DateSpecificAvailability availability) {
        return DateSpecificAvailabilityResponse.builder()
                .id(availability.getId())
                .specificDate(availability.getSpecificDate())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .type(availability.getType().name())
                .slotDurationMinutes(availability.getSlotDurationMinutes())
                .reason(availability.getReason())
                .isActive(availability.getIsActive())
                .createdAt(availability.getCreatedAt())
                .build();
    }
}