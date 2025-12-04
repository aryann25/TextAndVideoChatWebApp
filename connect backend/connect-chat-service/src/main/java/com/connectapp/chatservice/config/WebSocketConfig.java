package com.connectapp.chatservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic");       // Server -> client
        registry.setApplicationDestinationPrefixes("/app");    // Client -> server
        registry.setUserDestinationPrefix("/user");            // For private chats
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .setHandshakeHandler(new MobilePrincipalHandshakeHandler()) // extract phone
                .addInterceptors(new MobileNumberHandshakeInterceptor())
                .withSockJS();
    }
}
