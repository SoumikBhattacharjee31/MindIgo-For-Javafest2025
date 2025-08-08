package com.mindigo.content_service.repositories;

import com.mindigo.content_service.models.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {

}
