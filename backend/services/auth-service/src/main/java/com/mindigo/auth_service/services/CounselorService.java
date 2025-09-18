package com.mindigo.auth_service.services;

import com.mindigo.auth_service.dto.response.CounselorProfileResponse;
import com.mindigo.auth_service.entity.Counselor;
import com.mindigo.auth_service.repositories.CounselorRepository;
import com.mindigo.auth_service.repositories.specifications.CounselorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CounselorService {

    private final CounselorRepository counselorRepository;
    private final CounselorSpecification counselorSpecification;

    @Transactional(readOnly = true)
    public Page<CounselorProfileResponse> getAllApprovedCounselors(
            int page, int size, String search, Boolean acceptsInsurance, String specialization, String[] sort) { // Add parameter

        // 1. Create Sort object (logic remains the same)
        List<Sort.Order> orders = new ArrayList<>();
        // ... (sorting logic as before) ...
        for (String sortOrder : sort) {
            String[] parts = sortOrder.split(",");
            if (parts.length == 2) {
                orders.add(new Sort.Order(Sort.Direction.fromString(parts[1]), parts[0]));
            }
        }

        // 2. Create Pageable object
        Pageable pageable = PageRequest.of(page, size, Sort.by(orders));

        // 3. Build the dynamic specification with the new specialization filter
        Specification<Counselor> spec = counselorSpecification.build(search, acceptsInsurance, specialization);

        // 4. Execute the query
        Page<Counselor> counselorPage = counselorRepository.findAll(spec, pageable);

        // 5. Map the results (logic remains the same)
        return counselorPage.map(counselor -> CounselorProfileResponse.fromUser(counselor.getUser()));
    }
}