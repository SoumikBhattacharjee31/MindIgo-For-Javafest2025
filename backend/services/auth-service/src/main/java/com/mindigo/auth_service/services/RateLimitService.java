package com.mindigo.auth_service.services;

import com.mindigo.auth_service.exceptions.RateLimitExceededException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RedisTemplate<String, Integer> redisTemplate;

    /**
     * Check if rate limit is exceeded for a specific operation
     *
     * @param operation The operation name (e.g., "login", "register")
     * @param identifier The identifier (usually email or IP)
     * @param maxAttempts Maximum number of attempts allowed
     * @param timeWindowSeconds Time window in seconds
     * @throws RateLimitExceededException If rate limit is exceeded
     */
    public void checkRateLimit(String operation, String identifier, int maxAttempts, int timeWindowSeconds) {
//        String key = String.format("rate_limit:%s:%s", operation, identifier);
//        ValueOperations<String, Integer> ops = redisTemplate.opsForValue();
//
//        Integer attempts = ops.get(key);
//        if (attempts == null) {
//            attempts = 0;
//        }
//
//        if (attempts >= maxAttempts) {
//            log.warn("Rate limit exceeded for {} with identifier: {}", operation, identifier);
//            throw new RateLimitExceededException(
//                    String.format("Too many requests. Please try again later. (Limit: %d attempts per %d seconds)",
//                            maxAttempts, timeWindowSeconds));
//        }
//
//        // Increment counter and set expiration if this is the first attempt
//        if (attempts == 0) {
//            ops.set(key, 1, timeWindowSeconds, TimeUnit.SECONDS);
//        } else {
//            ops.increment(key);
//        }
    }

    /**
     * Reset rate limit for a specific operation and identifier
     */
    public void resetRateLimit(String operation, String identifier) {
        String key = String.format("rate_limit:%s:%s", operation, identifier);
        redisTemplate.delete(key);
    }
}