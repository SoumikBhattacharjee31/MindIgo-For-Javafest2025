package com.mindigo.assessment_service.services;

import com.mindigo.assessment_service.dto.sleep.SleepRequest;
import com.mindigo.assessment_service.dto.sleep.SleepResponse;
import com.mindigo.assessment_service.models.SleepData;
import com.mindigo.assessment_service.repositories.SleepDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SleepService {

    private final SleepDataRepository repository;

    private SleepResponse mapToDTO(SleepData entity) {
        return SleepResponse
                .builder()
                .date(entity.getDate())
                .wakeTime(entity.getWakeTime())
                .sleepTime(entity.getSleepTime())
                .build();
    }

    @Transactional
    public SleepResponse saveOrUpdate(SleepRequest request) {
        if (request.getUserId() == null || request.getDate() == null) {
            throw new IllegalArgumentException("UserId and Date must not be null");
        }

        Optional<SleepData> existing = repository.findByUserIdAndDate(request.getUserId(), request.getDate());
        SleepData entity;

        if (existing.isPresent()) {
            entity = existing.get();
            entity.setSleepTime(request.getSleepTime());
            entity.setWakeTime(request.getWakeTime());
        } else {
            entity = new SleepData(
                    null,
                    request.getUserId(),
                    request.getDate(),
                    request.getSleepTime(),
                    request.getWakeTime()
            );
        }
        return mapToDTO(repository.save(entity));
    }

    public void deleteByUserIdAndDate(Long userId, LocalDate date) {
        Optional<SleepData> existing = repository.findByUserIdAndDate(userId, date);
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("No sleep data found for the given date");
        }
        repository.deleteByUserIdAndDate(userId, date);
    }

    public List<SleepResponse> getAllByUserId(Long userId) {
        return repository.findAll()
                .stream()
                .filter(sd -> sd.getUserId().equals(userId))
                .map(this::mapToDTO)
                .toList();
    }

    public List<SleepResponse> getLastNDays(Long userId, LocalDate today, int days) {
        if (days <= 0) throw new IllegalArgumentException("Days must be greater than 0");
        LocalDate startDate = today.minusDays(days - 1);
        return repository.findByUserIdAndDateBetween(userId, startDate, today)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
}
