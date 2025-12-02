package com.connectapp.auth.controller;

import com.connectapp.auth.dto.*;
import com.connectapp.auth.repository.UserRepository;
import com.connectapp.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")   
@RequiredArgsConstructor
//@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class AuthController {

    private final AuthService authService;
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            MessageResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
        	 e.printStackTrace();
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOTP(@Valid @RequestBody OTPRequest request) {
        try {
            MessageResponse response = authService.requestOTP(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("OTP request error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody OTPVerifyRequest request) {
        try {
            AuthResponse response = authService.verifyOTPAndLogin(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("OTP verification error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(new MessageResponse("Auth Service is running"));
    }
    

    @GetMapping("/check-user")
    public ResponseEntity<Boolean> checkUser(@RequestParam String mobile) {
        boolean exists = userRepository.existsByMobile(mobile); 
        return ResponseEntity.ok(exists);
    }

}
