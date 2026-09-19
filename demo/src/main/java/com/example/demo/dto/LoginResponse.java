package com.example.demo.dto;

import com.nimbusds.jose.JWEHeader.Builder;

public class LoginResponse {
        private final String token;
        private final String tokenType;

        public LoginResponse(String token, String tokenType) {
        this.token = token;
        this.tokenType = tokenType;
        }

        public String getToken() {
        return token;
        }

        public String getTokenType() {
        return tokenType;
        }

        public static Builder builder() {
            return null;
        }


        
        public void setAccessToken(String string) {
            // TODO Auto-generated method stub
            throw new UnsupportedOperationException("Unimplemented method 'setAccessToken'");
        }

        public void setRefreshToken(String string) {
            // TODO Auto-generated method stub
            throw new UnsupportedOperationException("Unimplemented method 'setRefreshToken'");
        }
}