package com.connectapp.auth.service;

import com.connectapp.auth.dto.*;
import com.connectapp.auth.entity.User;
import com.connectapp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OTPService otpService;
    private final JwtService jwtService;

    /**
     * Register new user and send OTP
     */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        log.info("Registration attempt for mobile: {}", request.getMobile());

        if (userRepository.existsByMobile(request.getMobile())) {
            throw new RuntimeException("Mobile number already registered");
        }

        LocalDate dob;
        try {
            dob = LocalDate.parse(request.getBirthDate());
        } catch (Exception e) {
            throw new RuntimeException("Invalid birthDate format. Use YYYY-MM-DD");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .birthDate(dob)
                .mobile(request.getMobile())
                .verified(false)
                .active(true)
                .build();

        userRepository.save(user);

        // Send OTP and get the generated code
        String otp = otpService.sendOTP(user.getMobile());

        return new MessageResponse("Registration successful. OTP sent to your mobile number.", otp);
    }

    public MessageResponse requestOTP(OTPRequest request) {
        User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new RuntimeException("User not found. Please register first."));

        if (!user.isActive()) {
            throw new RuntimeException("User account is inactive");
        }

        String otp = otpService.sendOTP(request.getMobile());

        return new MessageResponse("OTP sent successfully to your mobile number.", otp);
    }


    /**
     * Verify OTP and login user
     */
    @Transactional
    public AuthResponse verifyOTPAndLogin(OTPVerifyRequest request) {
        log.info("OTP verification attempt for mobile: {}", request.getMobile());

        User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!otpService.verifyOTP(request.getMobile(), request.getOtp())) {
            log.warn("Invalid or expired OTP for mobile: {}", request.getMobile());
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Mark user as verified (first-time verification)
        if (!user.isVerified()) {
            user.setVerified(true);
            userRepository.save(user);
            log.info("User verified for mobile: {}", request.getMobile());
        }

        // Generate JWT
        String token = jwtService.generateToken(user.getId(), user.getMobile());

        log.info("Login successful for mobile: {}", request.getMobile());

        return new AuthResponse(
                token,
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getMobile()
        );
    }
}
