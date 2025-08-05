package com.mindigo.gateway_server.config;

//import com.mindigo.gateway_server.util.JwtUtil;
//import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpCookie;
        import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Autowired
    private RestTemplate restTemplate;

//    @Autowired
//    private UserDetailsService userDetailsService;

//    @Autowired
//    private JwtUtil jwtUtil;

    @Autowired
    private RouteValidator routeValidator;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {

        return ((exchange, chain) -> {

            // Skip authentication for unsecured routes (e.g., /api/v1/auth/**)
            if (!routeValidator.isSecured.test(exchange.getRequest())) {
                return chain.filter(exchange);
            }

            // Get JWT from cookie
            ServerHttpRequest request = exchange.getRequest();
            MultiValueMap<String, HttpCookie> cookies = request.getCookies();
            HttpCookie jwtCookie = cookies.getFirst("jwtToken"); // Replace "jwtToken" with your cookie name
            String jwt = (jwtCookie != null) ? jwtCookie.getValue() : null;

            if (jwt == null) {
                throw new RuntimeException("Missing JWT token in cookie");
            }

            try{
                // REST call to auth service
                restTemplate.getForObject("http://auth-service/validate?token="+jwt, String.class);

//                // Optional: Set authentication context if needed for downstream services
//                String userEmail = jwtUtil.extractUsername(jwt);
//                String id = jwtUtil.extractId(jwt);
//
//                if (userEmail != null && !userEmail.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
//                    UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
//                    if (jwtUtil.isTokenValid(jwt, userDetails)) {
//                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                                userDetails,
//                                id,
//                                userDetails.getAuthorities()
//                        );
//                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                        SecurityContextHolder.getContext().setAuthentication(authToken);
//                        System.out.println("Valid");
//                    }
//                }
            }catch (RestClientException e) {
                System.out.println("Invalid JWT token: " + e.getMessage());
                throw new RuntimeException("Unauthorized access: Invalid JWT token");
            } catch (Exception e) {
                System.out.println("Error validating token: " + e.getMessage());
                throw new RuntimeException("Unauthorized access to application");
            }

            return chain.filter(exchange);
        });
    }

    public static class Config {

    }
}
