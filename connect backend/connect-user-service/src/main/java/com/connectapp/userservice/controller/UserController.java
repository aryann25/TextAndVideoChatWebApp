package com.connectapp.userservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/users/test")
    public String test() {
        return "✅ User Service is working and registered with Eureka!";
    }
}