package com.connectapp.videoservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ConnectVideoServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConnectVideoServiceApplication.class, args);
	}

}
