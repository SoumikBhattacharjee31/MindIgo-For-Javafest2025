package com.mindigo.gateway_server.config;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.function.Predicate;

@Component
public class RouteValidator {

    public Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();

        // Allow all /api/v1/auth/** endpoints
        if (path.startsWith("/api/v1/auth/hello")) {
            return true;
        }
        if (path.startsWith("/api/v1/auth/")) {
            return false;
        }

        if (path.startsWith("/api/v1/routines")) {
            return false;
        }
        if (path.startsWith("/api/v1/admin")) {
            return false;
        }

        // Allow any /api/v1/**/test
        return !path.matches("^/api/v1/.*/test/?$");

        // Secure everything else
    };
}
