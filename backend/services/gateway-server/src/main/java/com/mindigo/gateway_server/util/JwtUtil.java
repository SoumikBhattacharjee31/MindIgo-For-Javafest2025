package com.mindigo.gateway_server.util;

//import com.mindigo.auth_service.user.User;
//import com.mindigo.auth_service.user.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor

public class JwtUtil {

    // Base64 encoded key
    private static final String SECRET_KEY = "MkY1WUY5OUhxRGNzOURSRWFiYnNiamZxN2JNSnBucFo=";

    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }
    public String extractId(String token){
        return extractClaim(token, Claims::getId);
    }
    private Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    private SecretKey getSignInKey(){
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimResolver){
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token){
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
