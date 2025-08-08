package com.mindigo.auth_service.utils;

import com.mindigo.auth_service.services.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CookieHelper {

    @Value("${app.cookie.secure:true}")
    private boolean secureCookies;

    @Value("${app.cookie.same-site:strict}")
    private String sameSite;

    private final JwtService jwtService;

    public void setSecureCookie(HttpServletResponse response, String name, String value, long maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookies);
        cookie.setMaxAge((int) maxAgeSeconds);

        // Set SameSite attribute
        cookie.setAttribute("SameSite", sameSite);

        response.addCookie(cookie);
    }

    public void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookies);
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", sameSite);
        response.addCookie(cookie);
    }

    public String getEmailFromCookie(HttpServletRequest request) {
        String accessToken = getTokenFromCookie(request, "accessToken");
        if (accessToken == null || accessToken.isEmpty()) {
            return null;
        }
        try {
            return jwtService.extractUsername(accessToken);
        } catch (Exception e) {
            return null;
        }
    }

    public String getTokenFromCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }

        return java.util.Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}