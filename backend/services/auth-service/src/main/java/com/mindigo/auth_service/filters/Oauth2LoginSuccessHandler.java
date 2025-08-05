//package com.mindigo.auth_service.auth;
//
//import com.mindigo.auth_service.utils.CookieHelper;
//import com.mindigo.auth_service.jwt.JwtService;
//import com.mindigo.auth_service.models.User;
//import com.mindigo.auth_service.models.UserConnectedAccount;
//import com.mindigo.auth_service.user.repositories.ConnectedAccountRepository;
//import com.mindigo.auth_service.user.repositories.UserRepository;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import java.io.IOException;
//import java.util.List;
//import java.util.Optional;
//
//import lombok.Getter;
//import lombok.Setter;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
//import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
//import org.springframework.stereotype.Component;
//import org.springframework.transaction.annotation.Transactional;
//
//
//@Configuration
//@ConfigurationProperties(prefix = "app")
//@Setter
//@Getter
//class ApplicationProperties {
//    private List<String> allowedOrigins;
//    private String applicationName;
//    private String baseUrl;
//    private String loginPageUrl;
//    private String loginSuccessUrl;
//    private String adminUserEmail;
//    private String adminUserPassword;
//}
//
//
//
//@Component
//@Slf4j
//public class Oauth2LoginSuccessHandler implements AuthenticationSuccessHandler {
//
//    private final ConnectedAccountRepository connectedAccountRepository;
//    private final ApplicationProperties applicationProperties;
//    private final UserRepository userRepository;
//    private final JwtService jwtService;
//
//    public Oauth2LoginSuccessHandler(ApplicationProperties applicationProperties,
//                                     UserRepository userRepository,
//                                     ConnectedAccountRepository connectedAccountRepository,
//                                     JwtService jwtService) {
//        this.applicationProperties = applicationProperties;
//        this.userRepository = userRepository;
//        this.connectedAccountRepository = connectedAccountRepository;
//        this.jwtService = jwtService;
//    }
//
//    @Override
//    @Transactional
//    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
//                                        Authentication authentication) throws IOException {
//        OAuth2AuthenticationToken authenticationToken = (OAuth2AuthenticationToken) authentication;
//        String provider = authenticationToken.getAuthorizedClientRegistrationId();
//        String providerId = authentication.getName();
//        String email = authenticationToken.getPrincipal().getAttribute("email");
//
//        // First check if we have the user based on a connected account (provider / providerId)
//        Optional<UserConnectedAccount> connectedAccount = connectedAccountRepository.findByProviderAndProviderId(provider, providerId);
//        if (connectedAccount.isPresent()) {
//            authenticateUser(connectedAccount.get().getUser(), response);
//            return;
//        }
//
//        // At this point we don't have a connected account, so we either find a user by email and add the connected account
//        // , or we create a new user
//        User existingUser = userRepository.findByEmail(email).orElse(null);
//        if (existingUser != null) {
//            UserConnectedAccount newConnectedAccount = new UserConnectedAccount(provider, providerId, existingUser);
//            existingUser.addConnectedAccount(newConnectedAccount);
//            existingUser = userRepository.save(existingUser);
//            connectedAccountRepository.save(newConnectedAccount);
//            authenticateUser(existingUser, response);
//        } else {
//            User newUser = createUserFromOauth2User(authenticationToken);
//            authenticateUser(newUser, response);
//        }
//    }
//
//    private void authenticateUser(User user, HttpServletResponse response) throws IOException {
//        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
//        SecurityContextHolder.getContext().setAuthentication(token);
//        var jwtToken = jwtService.generateToken(user);
//        CookieHelper.addCookie(response,"jwtToken",jwtToken);
//        response.sendRedirect(applicationProperties.getLoginSuccessUrl());
//    }
//
//    private User createUserFromOauth2User(OAuth2AuthenticationToken authentication) {
//        User user = new User(authentication.getPrincipal());
//        String provider = authentication.getAuthorizedClientRegistrationId();
//        String providerId = authentication.getName();
//        UserConnectedAccount connectedAccount = new UserConnectedAccount(provider, providerId, user);
//        user.addConnectedAccount(connectedAccount);
//        user = userRepository.save(user);
//        connectedAccountRepository.save(connectedAccount);
//        return user;
//    }
//}
