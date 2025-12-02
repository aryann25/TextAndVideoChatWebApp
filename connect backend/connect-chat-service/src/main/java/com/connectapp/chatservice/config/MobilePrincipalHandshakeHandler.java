package com.connectapp.chatservice.config;

import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class MobilePrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(org.springframework.http.server.ServerHttpRequest request,
                                      org.springframework.web.socket.WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {

        String mobile = (String) attributes.get("mobile");
        if (mobile != null) {
            System.out.println("[HandshakeHandler] Principal created for mobile: " + mobile);
            return new MobilePrincipal(mobile);
        } else {
            System.out.println("[HandshakeHandler] No mobile in attributes for Principal.");
            return null;
        }
    }
}
