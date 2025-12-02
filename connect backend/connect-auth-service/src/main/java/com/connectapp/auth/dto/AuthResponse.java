package com.connectapp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String firstName;
    private String lastName;
    private String mobile;

    public AuthResponse(String token, Long userId, String firstName, String lastName, String mobile) {
        this.token = token;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.mobile = mobile;
    }
}
