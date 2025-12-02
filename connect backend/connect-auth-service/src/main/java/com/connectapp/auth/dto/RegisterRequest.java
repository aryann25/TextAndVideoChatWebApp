package com.connectapp.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {

    private String firstName;
    private String middleName;
    private String lastName;
    private String birthDate;   // YYYY-MM-DD string
    private String mobile;
}
