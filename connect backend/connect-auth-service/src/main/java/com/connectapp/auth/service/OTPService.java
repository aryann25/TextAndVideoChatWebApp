package com.connectapp.auth.service;

import com.connectapp.auth.entity.OTP;
import com.connectapp.auth.repository.OTPRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final OTPRepository otpRepository;
    private final SMSService smsService;

    @Value("${otp.expiration}")
    private long otpExpiration; // in SECONDS

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    @Transactional
    public String sendOTP(String mobile) {
        String otpCode = generateOTP();

        LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(otpExpiration);

        OTP otp = new OTP();
        otp.setMobile(mobile);
        otp.setOtpCode(otpCode);
        otp.setExpiryTime(expiryTime);

        otpRepository.save(otp);

        smsService.sendOTP(mobile, otpCode);

        log.info("OTP generated and sent to mobile: {}", mobile);
        return otpCode;
    }


    public boolean verifyOTP(String mobile, String otpCode) {
        return otpRepository.findByMobileAndOtpCodeAndUsedFalseAndExpiryTimeAfter(
                        mobile, otpCode, LocalDateTime.now())
                .map(otp -> {
                    otp.setUsed(true);
                    otpRepository.save(otp);
                    log.info("OTP verified successfully for mobile: {}", mobile);
                    return true;
                })
                .orElseGet(() -> {
                    log.warn("Invalid or expired OTP for mobile: {}", mobile);
                    return false;
                });
    }

    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredOTPs() {
        otpRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
        log.info("Expired OTPs cleaned up");
    }
}

