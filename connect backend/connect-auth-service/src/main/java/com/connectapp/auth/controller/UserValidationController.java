package com.connectapp.auth.controller;

import com.connectapp.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/user")
public class UserValidationController {

    private final UserRepository userRepository;

    public UserValidationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/exists/{mobile}")
    public ResponseEntity<Boolean> checkUserExists(@PathVariable String mobile) {
        boolean exists = userRepository.existsByMobile(mobile);
        return ResponseEntity.ok(exists);
    }
}
