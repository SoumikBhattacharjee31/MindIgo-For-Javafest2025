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
        return (exchange, chain) -> {
            // Skip authentication for unsecured routes
            System.out.println("Here");
            if (!routeValidator.isSecured.test(exchange.getRequest())) {
                System.out.println("Safe");
                return chain.filter(exchange);
            }
            System.out.println("Oops");

            // Get JWT from cookie
            ServerHttpRequest request = exchange.getRequest();
            MultiValueMap<String, HttpCookie> cookies = request.getCookies();
            HttpCookie jwtCookie = cookies.getFirst("jwtToken");
            String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

            if (jwt == null) {
                return Mono.error(new RuntimeException("Missing JWT token in cookie"));
            }

            // Validate JWT and get user details
            return webClient.get()
                    .uri("http://AUTH-SERVICE/api/v1/auth/validate?token=" + jwt)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, response ->
                            Mono.error(new RuntimeException("Auth service error: " + response.statusCode())))
                    .bodyToMono(ValidateResponse.class)
                    .flatMap(response -> {
                        // Validate response
                        if (response.getId() == null || response.getEmail() == null) {
                            return Mono.error(new RuntimeException("Invalid JWT token: Missing id or email"));
                        }

                        System.out.println("Validated user: " + response.getEmail() + " (ID: " + response.getId() + ")");

                        // Add user info to request headers for downstream services
                        ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                                .header("X-User-Id", String.valueOf(response.getId()))
                                .header("X-User-Email", response.getEmail())
                                .header("X-Authenticated", "true") // Optional: flag for authenticated requests
                                .build();

                        // Continue with modified request
                        return chain.filter(exchange.mutate().request(modifiedRequest).build());
                    })
                    .onErrorResume(Exception.class, e -> {
                        System.err.println("Authentication failed: " + e.getMessage());
                        // Return 401 Unauthorized response
                        ServerHttpResponse response = exchange.getResponse();
                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                        response.getHeaders().add("Content-Type", "application/json");
                        String body = "{\"error\":\"Unauthorized\",\"message\":\"Invalid or expired token\"}";
                        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
                        return response.writeWith(Mono.just(buffer));
                    });
        };
    }

    public static class Config {
    }

    // Inner class to match the ValidateResponse DTO
    public static class ValidateResponse {
        private Long id;
        private String email;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}