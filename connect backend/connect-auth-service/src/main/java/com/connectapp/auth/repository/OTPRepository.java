package com.connectapp.auth.repository;

import com.connectapp.auth.entity.OTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByMobileAndOtpCodeAndUsedFalseAndExpiryTimeAfter(
        String mobile, String otpCode, LocalDateTime currentTime);
    void deleteByExpiryTimeBefore(LocalDateTime currentTime);
}