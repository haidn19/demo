        package com.example.demo.security;

        import io.jsonwebtoken.Claims;
        import io.jsonwebtoken.Jwts;
        import io.jsonwebtoken.io.Decoders;
        import io.jsonwebtoken.security.Keys;

        import org.springframework.beans.factory.annotation.Value;
        import org.springframework.security.core.Authentication;
        import org.springframework.security.core.GrantedAuthority;
        import org.springframework.stereotype.Service;


import javax.crypto.SecretKey;

import java.util.Date;
        import java.util.List;


        @Service
        public class JwtService {

        @Value("${jwt.secret}")
        private String secret;

        @Value("${jwt.expiration}")
        private long expiration;

        private SecretKey getKey() {
                return Keys.hmacShaKeyFor(
                        Decoders.BASE64.decode(secret)
                );
        }

        public String generateToken(Authentication authentication) {

                List<String> roles = authentication
                        .getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList();

                Date now = new Date();
                Date expiry = new Date(now.getTime() + expiration);

                return Jwts.builder()
                        .subject(authentication.getName())
                        .claim("roles", roles)
                        .issuedAt(now)
                        .expiration(expiry)
                        .signWith(getKey(), Jwts.SIG.HS256)
                        .compact();
        }

        public Claims getClaims(String token) {

                return Jwts.parser()
                        .verifyWith(getKey())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
        }

        public String getUsername(String token) {
                return getClaims(token).getSubject();
        }

        public List<String> getRoles(String token) {

                return getClaims(token)
                        .get("roles", List.class);
        }

        public boolean isValid(String token) {

                return getClaims(token)
                        .getExpiration()
                        .after(new Date());
        }
}