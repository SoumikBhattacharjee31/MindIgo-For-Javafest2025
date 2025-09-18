package com.mindigo.gateway_server.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    // Define a clear list of all public API prefixes.
    // Anything NOT in this list will be considered secured.
    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/",
            "/api/v1/routines/",
            "/api/v1/auth/test",
            "/api/v1/assessment/test",
            "/api/v1/content/test",
            "/api/v1/ai/test",
            "/api/v1/genai/test"
    );

    // The predicate returns 'true' if the request path does NOT start with any of the public prefixes.
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().startsWith(uri));
}