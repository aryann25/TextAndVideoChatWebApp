package com.connectapp.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SMSService {

    @Value("${sms.provider:console}")  // console | twilio | msg91 | sns
    private String provider;

    @Value("${sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${sms.twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Value("${sms.msg91.auth-key:}")
    private String msg91AuthKey;

    public void sendOTP(String mobile, String otp) {

        switch (provider.toLowerCase()) {
            case "twilio":
                sendViaTwilio(mobile, otp);
                break;

            case "msg91":
                sendViaMSG91(mobile, otp);
                break;

            case "sns":
                sendViaAWSSNS(mobile, otp);
                break;

            default:
                logToConsole(mobile, otp);
        }
    }

    // ==================== DEV MODE (DEFAULT) ====================

    private void logToConsole(String mobile, String otp) {
        log.info("========================================");
        log.info("DEV MODE: OTP not sent via real SMS provider");
        log.info("Mobile: {}", mobile);
        log.info("OTP: {}", otp);
        log.info("========================================");
    }

    // ==================== TWILIO SENDER =========================

    private void sendViaTwilio(String mobile, String otp) {
        try {
            com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);

            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber("+91" + mobile),
                    new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                    "Your Connect OTP is: " + otp
            ).create();

            log.info("OTP sent via Twilio successfully to {}", mobile);

        } catch (Exception e) {
            log.error("Error sending OTP via Twilio: {}", e.getMessage());
        }
    }

    // ==================== MSG91 SENDER ==========================

    private void sendViaMSG91(String mobile, String otp) {
        try {
            // Just a placeholder — actual API call can be added later
            log.info("MSG91: OTP sending example (-- integrate API here --)");
            log.info("Mobile: {}", mobile);
            log.info("OTP: {}", otp);

        } catch (Exception e) {
            log.error("Error sending OTP via MSG91: {}", e.getMessage());
        }
    }

    // ==================== AWS SNS SENDER =========================

    private void sendViaAWSSNS(String mobile, String otp) {
        try {
            // Placeholder for AWS SNS — later we add AWS SDK code
            log.info("AWS SNS: OTP sending example (-- integrate API here --)");
            log.info("Mobile: {}", mobile);
            log.info("OTP: {}", otp);

        } catch (Exception e) {
            log.error("Error sending OTP via AWS SNS: {}", e.getMessage());
        }
    }
}
