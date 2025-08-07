package com.mindigo.gateway_server.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.loadbalancer.reactive.ReactorLoadBalancerExchangeFilterFunction;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component("JwtAuthFilter")
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private RouteValidator routeValidator;

    public JwtAuthGatewayFilterFactory(ReactorLoadBalancerExchangeFilterFunction lbFunction) {
        super(Config.class);
        this.webClient = WebClient.builder()
                .filter(lbFunction) // Enable Eureka load balancing
                .build();
    }

    @Override
    public GatewayFilter apply(Config config) {
        System.out.println("???");
        return (exchange, chain) -> {
            // Skip authentication for unsecured routes
            System.out.println("here");
            if (!routeValidator.isSecured.test(exchange.getRequest())) {
                System.out.println("safe");
                return chain.filter(exchange);
            }
            System.out.println("oops");

            // Get JWT from cookie - auth service sets "accessToken" cookie
            ServerHttpRequest request = exchange.getRequest();
            MultiValueMap<String, HttpCookie> cookies = request.getCookies();

            HttpCookie jwtCookie = cookies.getFirst("accessToken");
            String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

            System.out.println("jwt found?");
            if (jwt == null) {
                return createUnauthorizedResponse(exchange, "Missing JWT token in cookie");
            }
            System.out.println("yes");

            // Validate JWT and get user details
            return webClient.get()
                    .uri("http://AUTH-SERVICE/api/v1/auth/validate?token=" + jwt)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response -> {
                        if (response.statusCode() == HttpStatus.UNAUTHORIZED) {
                            return Mono.error(new RuntimeException("Invalid or expired JWT token"));
                        }
                        return Mono.error(new RuntimeException("Auth service error: " + response.statusCode()));
                    })
                    .bodyToMono(ApiResponseClass.class)
                    .flatMap(apiResponse -> {
                        // Check if the API response indicates success
                        if (!apiResponse.isSuccess() || apiResponse.getData() == null) {
                            return Mono.error(new RuntimeException("Invalid JWT token: " + apiResponse.getMessage()));
                        }

                        ValidateResponse validateResponse = apiResponse.getData();

                        // Validate response data
                        if (validateResponse.getUserId() == null || validateResponse.getEmail() == null) {
                            return Mono.error(new RuntimeException("Invalid JWT token: Missing user data"));
                        }

                        System.out.println("Validated user: " + validateResponse.getEmail() +
                                " (ID: " + validateResponse.getUserId() + ")");

                        // Add user info to request headers for downstream services
                        ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                .header("X-User-Id", String.valueOf(validateResponse.getUserId()))
                                .header("X-User-Email", validateResponse.getEmail())
                                .header("X-User-Role", validateResponse.getRole())
                                .header("X-Authenticated", "true")
                                .build();

                        // Continue with modified request
                        return chain.filter(exchange.mutate().request(modifiedRequest).build());
                    })
                    .onErrorResume(Exception.class, e -> {
                        System.err.println("Authentication failed: " + e.getMessage());
                        return createUnauthorizedResponse(exchange, "Invalid or expired token");
                    });
        };
    }

    private Mono<Void> createUnauthorizedResponse(org.springframework.web.server.ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");

        String body = String.format("{\"success\":false,\"error\":\"Unauthorized\",\"message\":\"%s\"}", message);
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // Configuration properties can be added here if needed
    }

    // Wrapper class to match the ApiResponseClass structure from auth service
    public static class ApiResponseClass {
        private boolean success;
        private ValidateResponse data;
        private String message;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public ValidateResponse getData() {
            return data;
        }

        public void setData(ValidateResponse data) {
            this.data = data;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // Inner class to match the ValidateResponse DTO from auth service
    public static class ValidateResponse {
        private Long userId;
        private String email;
        private String role;
        private boolean valid;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }
    }
}