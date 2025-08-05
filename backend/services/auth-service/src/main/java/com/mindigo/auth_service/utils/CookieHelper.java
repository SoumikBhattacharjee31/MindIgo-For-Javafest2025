package com.mindigo.auth_service.utils;

import com.mindigo.auth_service.jwt.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class CookieHelper {

    @Autowired
    private JwtService jwtService;

    public static void removeCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // Delete the cookie
        response.addCookie(cookie);
    }

    public static void addCookie(HttpServletResponse response, String name, String value) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(86400); // 1 day
        response.addCookie(cookie);
    }

    public String getMailFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        Cookie jwtCookie = Arrays.stream(cookies)
                .filter(cookie -> "jwtToken".equals(cookie.getName()))
                .findFirst()
                .orElse(null);
        String jwt, userEmail;
        if (jwtCookie != null) {
            jwt = jwtCookie.getValue();
            userEmail = jwtService.extractUsername(jwt);
        }
        else throw new RuntimeException("No jwtToken found in cookies");
        return userEmail;
    }
}
