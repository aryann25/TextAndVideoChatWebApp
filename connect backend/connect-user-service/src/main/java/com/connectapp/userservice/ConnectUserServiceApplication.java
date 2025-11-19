package com.connectapp.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ConnectUserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConnectUserServiceApplication.class, args);
    }
}