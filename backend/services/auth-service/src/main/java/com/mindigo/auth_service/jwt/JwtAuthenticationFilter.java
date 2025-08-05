package com.mindigo.auth_service.jwt;

import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip authentication for specific endpoints
        String requestURI = request.getRequestURI();
        if (requestURI.startsWith("/api/v1/auth/") || requestURI.equals("/app") || requestURI.startsWith("/api/test/")) {
            filterChain.doFilter(request, response); // Skip JWT validation
            return;
        }

        final String jwt;
        final String userEmail, id;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {

            Cookie jwtCookie = Arrays.stream(cookies)
                    .filter(cookie -> "jwtToken".equals(cookie.getName()))
                    .findFirst()
                    .orElse(null);

            System.out.println(jwtCookie);
            if (jwtCookie != null) {
                jwt = jwtCookie.getValue();

                userEmail = jwtService.extractUsername(jwt);
                id = jwtService.extractId(jwt);
                System.out.println(Objects.requireNonNullElse(id, "Id is null"));

                if (userEmail != null && !userEmail.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                id,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("Valid");
                    }
                }
            }

        }
        filterChain.doFilter(request, response);
    }
}
