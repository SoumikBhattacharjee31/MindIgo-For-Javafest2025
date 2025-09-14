package com.mindigo.appointment_service.service;

import com.mindigo.appointment_service.dto.request.*;
import com.mindigo.appointment_service.dto.response.*;
import com.mindigo.appointment_service.entity.*;
import com.mindigo.appointment_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CounselorAvailabilityRepository availabilityRepository;
    private final CounselorSettingsRepository settingsRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request, Long clientId, String clientEmail) {
        // Validate counselor exists
        CounselorResponse counselor = getCounselorProfile(request.getCounselorId());

        // Get counselor settings
        CounselorSettings settings = settingsRepository.findByCounselorId(request.getCounselorId())
                .orElse(CounselorSettings.builder()
                        .counselorId(request.getCounselorId())
                        .counselorEmail(counselor.getEmail())
                        .build());

        // Validate booking is within allowed timeframe
        LocalDateTime maxBookingDate = LocalDateTime.now().plusDays(settings.getMaxBookingDays());
        if (request.getStartTime().isAfter(maxBookingDate)) {
            throw new IllegalArgumentException("Booking exceeds maximum allowed days: " + settings.getMaxBookingDays());
        }

        // Calculate end time based on slot duration
        LocalDateTime endTime = request.getStartTime().plusMinutes(settings.getDefaultSlotDurationMinutes());

        // Check if slot is available
        if (!isSlotAvailable(request.getCounselorId(), request.getStartTime(), endTime)) {
            throw new IllegalArgumentException("The selected time slot is not available");
        }

        // Create appointment
        Appointment appointment = Appointment.builder()
                .clientId(clientId)
                .counselorId(request.getCounselorId())
                .clientEmail(clientEmail)
                .counselorEmail(counselor.getEmail())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .clientNotes(request.getNotes())
                .status(settings.getAutoAcceptAppointments() ? AppointmentStatus.CONFIRMED : AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Send notification emails
        sendAppointmentNotification(appointment, "CREATED");

        return mapToAppointmentResponse(appointment);
    }

    public List<TimeSlotResponse> getAvailableSlots(Long counselorId, LocalDate date) {
        // Get counselor settings
        CounselorSettings settings = settingsRepository.findByCounselorId(counselorId)
                .orElse(CounselorSettings.builder()
                        .counselorId(counselorId)
                        .maxBookingDays(10)
                        .defaultSlotDurationMinutes(60)
                        .build());

        // Check if date is within booking range
        LocalDate maxDate = LocalDate.now().plusDays(settings.getMaxBookingDays());
        if (date.isAfter(maxDate) || date.isBefore(LocalDate.now())) {
            return new ArrayList<>();
        }

        DayOfWeek dayOfWeek = date.getDayOfWeek();

        // Get availability for the day
        List<CounselorAvailability> availabilities = availabilityRepository
                .findByCounselorIdAndDayOfWeekAndIsActiveTrue(counselorId, dayOfWeek);

        if (availabilities.isEmpty()) {
            return new ArrayList<>();
        }

        // Get existing appointments for the date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        List<Appointment> existingAppointments = appointmentRepository
                .findByCounselorIdAndDateRangeAndStatus(counselorId, startOfDay, endOfDay,
                        List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED));

        List<TimeSlotResponse> availableSlots = new ArrayList<>();

        // Generate slots for each availability window
        for (CounselorAvailability availability : availabilities) {
            List<TimeSlotResponse> windowSlots = generateSlotsForWindow(
                    availability, date, existingAppointments);
            availableSlots.addAll(windowSlots);
        }

        return availableSlots.stream()
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .collect(Collectors.toList());
    }

    private List<TimeSlotResponse> generateSlotsForWindow(
            CounselorAvailability availability,
            LocalDate date,
            List<Appointment> existingAppointments) {

        List<TimeSlotResponse> slots = new ArrayList<>();
        LocalDateTime windowStart = date.atTime(availability.getStartTime());
        LocalDateTime windowEnd = date.atTime(availability.getEndTime());

        // Skip past slots
        if (windowStart.isBefore(LocalDateTime.now())) {
            windowStart = LocalDateTime.now().plusMinutes(30); // 30 min buffer
        }

        LocalDateTime currentSlotStart = windowStart;

        while (currentSlotStart.plusMinutes(availability.getSlotDurationMinutes()).isBefore(windowEnd) ||
                currentSlotStart.plusMinutes(availability.getSlotDurationMinutes()).equals(windowEnd)) {

            LocalDateTime currentSlotEnd = currentSlotStart.plusMinutes(availability.getSlotDurationMinutes());

            LocalDateTime finalCurrentSlotStart = currentSlotStart;
            boolean isAvailable = existingAppointments.stream()
                    .noneMatch(app -> isTimeOverlap(finalCurrentSlotStart, currentSlotEnd, app.getStartTime(), app.getEndTime()));

            slots.add(TimeSlotResponse.builder()
                    .startTime(currentSlotStart)
                    .endTime(currentSlotEnd)
                    .isAvailable(isAvailable)
                    .build());

            currentSlotStart = currentSlotEnd;
        }

        return slots;
    }

    private boolean isTimeOverlap(LocalDateTime start1, LocalDateTime end1,
                                  LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private boolean isSlotAvailable(Long counselorId, LocalDateTime startTime, LocalDateTime endTime) {
        // Check if there's availability for this day/time
        DayOfWeek dayOfWeek = startTime.getDayOfWeek();
        LocalTime timeStart = startTime.toLocalTime();
        LocalTime timeEnd = endTime.toLocalTime();

        List<CounselorAvailability> availabilities = availabilityRepository
                .findByCounselorIdAndDayOfWeekAndIsActiveTrue(counselorId, dayOfWeek);

        boolean hasAvailability = availabilities.stream()
                .anyMatch(avail -> !timeStart.isBefore(avail.getStartTime()) &&
                        !timeEnd.isAfter(avail.getEndTime()));

        if (!hasAvailability) {
            return false;
        }

        // Check for conflicts with existing appointments
        List<Appointment> conflicts = appointmentRepository
                .findConflictingAppointments(counselorId, startTime, endTime);

        return conflicts.isEmpty();
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(UpdateAppointmentStatusRequest request,
                                                       Long userId, String role) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        // Validate user can update this appointment
        if ("COUNSELOR".equals(role) && !appointment.getCounselorId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own appointments");
        }
        if ("CLIENT".equals(role) && !appointment.getClientId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own appointments");
        }

        AppointmentStatus newStatus = AppointmentStatus.valueOf(request.getStatus().toUpperCase());

        // Validate status transitions
        validateStatusTransition(appointment.getStatus(), newStatus, role);

        appointment.setStatus(newStatus);

        if ("COUNSELOR".equals(role)) {
            appointment.setCounselorNotes(request.getNotes());
            if (newStatus == AppointmentStatus.REJECTED) {
                appointment.setRejectionReason(request.getRejectionReason());
            }
        }

        appointment = appointmentRepository.save(appointment);

        // Send notification
        sendAppointmentNotification(appointment, newStatus.name());

        return mapToAppointmentResponse(appointment);
    }

    private void validateStatusTransition(AppointmentStatus currentStatus, AppointmentStatus newStatus, String role) {
        switch (currentStatus) {
            case PENDING:
                if ("COUNSELOR".equals(role) && !List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.REJECTED).contains(newStatus)) {
                    throw new IllegalArgumentException("Counselor can only confirm or reject pending appointments");
                }
                if ("CLIENT".equals(role) && newStatus != AppointmentStatus.CANCELLED) {
                    throw new IllegalArgumentException("Client can only cancel pending appointments");
                }
                break;
            case CONFIRMED:
                if (newStatus != AppointmentStatus.CANCELLED && newStatus != AppointmentStatus.COMPLETED) {
                    throw new IllegalArgumentException("Confirmed appointments can only be cancelled or completed");
                }
                break;
            default:
                throw new IllegalArgumentException("Cannot change status from " + currentStatus);
        }
    }

    public List<AppointmentResponse> getClientAppointments(Long clientId) {
        List<Appointment> appointments = appointmentRepository.findByClientIdOrderByStartTimeDesc(clientId);
        return appointments.stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getCounselorAppointments(Long counselorId) {
        List<Appointment> appointments = appointmentRepository.findByCounselorIdOrderByStartTimeDesc(counselorId);
        return appointments.stream()
                .map(this::mapToAppointmentResponse)
                .collect(Collectors.toList());
    }

    private AppointmentResponse mapToAppointmentResponse(Appointment appointment) {
        // Get user details from auth service
        CounselorResponse counselor = getCounselorProfile(appointment.getCounselorId());
        // Note: You might want to create a similar method for client details

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .clientId(appointment.getClientId())
                .counselorId(appointment.getCounselorId())
                .clientEmail(appointment.getClientEmail())
                .counselorEmail(appointment.getCounselorEmail())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus().name())
                .clientNotes(appointment.getClientNotes())
                .counselorNotes(appointment.getCounselorNotes())
                .rejectionReason(appointment.getRejectionReason())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .counselorName(counselor.getName())
                .build();
    }

    private CounselorResponse getCounselorProfile(Long counselorId) {
        try {
            String authServiceUrl = "http://AUTH-SERVICE/api/v1/auth/profilebyid/" + counselorId.intValue();
            ResponseEntity<ApiResponseClass> response = restTemplate.getForEntity(authServiceUrl, ApiResponseClass.class);
            if (response.getBody() != null && response.getBody().isSuccess()) {
                Map<String, Object> userData = (Map<String, Object>) response.getBody().getData();
                return CounselorResponse.builder()
                        .id(counselorId)
                        .name((String) userData.get("name"))
                        .email((String) userData.get("email"))
                        .profileImageUrl((String) userData.get("profileImageUrl"))
                        .build();
            }
        } catch (Exception e) {
            log.error("Error fetching counselor profile: {}", e.getMessage());
        }

        return CounselorResponse.builder()
                .id(counselorId)
                .name("Unknown Counselor")
                .email("unknown@example.com")
                .build();
    }

    private void sendAppointmentNotification(Appointment appointment, String action) {
        try {
            String mailServiceUrl = "http://MAIL-SERVICE/api/v1/mail/send-mail";

            // Create mail request (you'll need to define this DTO)
            Map<String, Object> mailRequest = Map.of(
                    "to", List.of(appointment.getClientEmail(), appointment.getCounselorEmail()),
                    "subject", "Appointment " + action,
                    "body", buildEmailBody(appointment, action)
            );

            restTemplate.postForEntity(mailServiceUrl, mailRequest, Object.class);
        } catch (Exception e) {
            log.error("Error sending appointment notification: {}", e.getMessage());
        }
    }

    private String buildEmailBody(Appointment appointment, String action) {
        return String.format(
                "Appointment %s\n\n" +
                        "Date & Time: %s\n" +
                        "Duration: %d minutes\n" +
                        "Status: %s\n\n" +
                        "Please log in to your account for more details.",
                action,
                appointment.getStartTime(),
                java.time.Duration.between(appointment.getStartTime(), appointment.getEndTime()).toMinutes(),
                appointment.getStatus()
        );
    }

    public List<LocalDate> getAvailableDates(Long counselorId) {
        CounselorSettings settings = settingsRepository.findByCounselorId(counselorId)
                .orElse(CounselorSettings.builder()
                        .counselorId(counselorId)
                        .maxBookingDays(10)
                        .build());

        List<CounselorAvailability> availabilities = availabilityRepository
                .findByCounselorIdAndIsActiveTrue(counselorId);

        if (availabilities.isEmpty()) {
            return new ArrayList<>();
        }

        List<LocalDate> availableDates = new ArrayList<>();
        LocalDate currentDate = LocalDate.now();
        LocalDate maxDate = currentDate.plusDays(settings.getMaxBookingDays());

        for (LocalDate date = currentDate; !date.isAfter(maxDate); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            boolean hasAvailability = availabilities.stream()
                    .anyMatch(avail -> avail.getDayOfWeek().equals(dayOfWeek));

            if (hasAvailability) {
                availableDates.add(date);
            }
        }

        return availableDates;
    }
}