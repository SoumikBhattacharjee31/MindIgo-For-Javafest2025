package com.mindigo.auth_service.repositories.specifications;

import com.mindigo.auth_service.entity.Counselor;
import com.mindigo.auth_service.entity.CounselorStatus;
import com.mindigo.auth_service.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CounselorSpecification {

    public Specification<Counselor> build(String search, Boolean acceptsInsurance, String specialization) { // Add parameter
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Always filter for APPROVED counselors
            predicates.add(criteriaBuilder.equal(root.get("counselorStatus"), CounselorStatus.APPROVED));

            // 2. Add filter for 'acceptsInsurance' if provided
            if (acceptsInsurance != null) {
                predicates.add(criteriaBuilder.equal(root.get("acceptsInsurance"), acceptsInsurance));
            }

            // 3. Add filter for 'specialization' if provided (exact match, case-insensitive)
            if (specialization != null && !specialization.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("specialization")),
                        specialization.toLowerCase()
                ));
            }

            // 4. Add broad search filter for name or specialization if 'search' term is provided
            if (search != null && !search.trim().isEmpty()) {
                Join<Counselor, User> userJoin = root.join("user");
                String searchTerm = "%" + search.toLowerCase() + "%";

                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(userJoin.get("name")), searchTerm);
                Predicate specializationPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("specialization")), searchTerm);

                predicates.add(criteriaBuilder.or(namePredicate, specializationPredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}