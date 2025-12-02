package com.connectapp.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
@Slf4j
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey getSigningKey() {
        // Ensure the secret is at least 256 bits (32 bytes) for HS256
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String mobile) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(userId.toString())                    // Changed from setSubject
                .claim("mobile", mobile)
                .issuedAt(now)                                 // Changed from setIssuedAt
                .expiration(expiryDate)                        // Changed from setExpiration
                .signWith(getSigningKey())                     // Removed SignatureAlgorithm parameter
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()                          // Changed from parserBuilder()
                .verifyWith(getSigningKey())                   // Changed from setSigningKey
                .build()
                .parseSignedClaims(token)                      // Changed from parseClaimsJws
                .getPayload();                                 // Changed from getBody()

        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()                                      // Changed from parserBuilder()
                    .verifyWith(getSigningKey())               // Changed from setSigningKey
                    .build()
                    .parseSignedClaims(token);                 // Changed from parseClaimsJws
            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
