package com.mindigo.gateway_server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.loadbalancer.reactive.ReactorLoadBalancerExchangeFilterFunction;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpCookie;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component("JwtAuthFilter")
public class JwtAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    private final WebClient webClient;

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
        System.out.println("YOOOOOOOOOOOOOOOOOOOOOOOOOO");

        return (exchange, chain) -> {
            // Skip authentication for unsecured routes
            if (!routeValidator.isSecured.test(exchange.getRequest())) {
                System.out.println("SAFE");
                return chain.filter(exchange);
            }

            // Get JWT from cookie
            ServerHttpRequest request = exchange.getRequest();
            MultiValueMap<String, HttpCookie> cookies = request.getCookies();
            HttpCookie jwtCookie = cookies.getFirst("jwtToken");
            String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

            if (jwt == null) {
                throw new RuntimeException("Missing JWT token in cookie");
            }

            System.out.println("Here");
            // Validate JWT via WebClient
            return webClient.get()
                    .uri("http://AUTH-SERVICE/api/v1/auth/validate?token=" + jwt)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnSuccess(response -> System.out.println("YO"))
                    .onErrorMap(Exception.class, e -> {
                        System.out.println("Invalid JWT token: " + e.getMessage());
                        return new RuntimeException("Unauthorized access: Invalid JWT token");
                    })
                    .then(chain.filter(exchange));
        };
    }

    public static class Config {
    }
}