package com.connectapp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String message;
    private String otp;  // NEW: Include OTP if needed

    // Constructor for backward compatibility (only message)
    public MessageResponse(String message) {
        this.message = message;
        this.otp = null;
    }
}
