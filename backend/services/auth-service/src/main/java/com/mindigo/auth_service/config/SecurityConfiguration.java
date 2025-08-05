package com.mindigo.auth_service.config;

import com.mindigo.auth_service.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
//    private final com.mindigo.auth_service.auth.Oauth2LoginSuccessHandler oauth2LoginSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        try {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(authorize -> authorize
                              .requestMatchers("/**").permitAll()
                            .anyRequest().authenticated()
                    )
//                    .oauth2Login(customizer-> customizer.successHandler(oauth2LoginSuccessHandler))
                    .authenticationProvider(authenticationProvider)
//                    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            ;
            return http.build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
