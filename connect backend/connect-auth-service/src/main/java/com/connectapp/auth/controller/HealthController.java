package com.connectapp.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/auth/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
