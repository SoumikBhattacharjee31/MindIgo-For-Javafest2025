package com.mindigo.auth_service.hello;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class Hello {

    @GetMapping("/hello")
    ResponseEntity<?> getHello(HttpServletRequest request) {
        System.out.println("=========================================");
        System.out.println(request.getHeader("X-User-Email"));
        System.out.println(request.getHeader("X-User-Id"));
        System.out.println(request.getHeader("X-User-Role"));
        System.out.println(request.getHeader("X-Authenticated"));
        System.out.println("=========================================");
        return ResponseEntity.ok("Hello World");
    }

}
