package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;

import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.request.LoginRequest;
import com.example.demo.security.JwtService;


@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    
    private final JwtService jwtService;

    AuthenticationService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest loginRequest) {
        
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            loginRequest.getUsername(), loginRequest.getPassword());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        
        LoginResponse response = new LoginResponse(null, null);
        response.setAccessToken(jwtService.generateToken(authentication));
        response.setRefreshToken(jwtService.generateToken(authentication));
        return response;
    }
}
