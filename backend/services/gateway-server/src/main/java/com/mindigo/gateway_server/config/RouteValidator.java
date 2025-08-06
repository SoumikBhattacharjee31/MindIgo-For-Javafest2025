package com.mindigo.gateway_server.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/eureka",
            "/api/v1/auth/register",
            "/api/v1/auth/validate",
            "/api/v1/auth/login",
            "/api/v1/auth/get-otp"
//            "/api/v1/auth/loginOtp"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().startsWith(uri));
}
