package com.connectapp.chatservice.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class MobileNumberHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        URI uri = request.getURI();
        String query = uri.getQuery(); // e.g., mobile=9876543210

        if (query != null && query.startsWith("mobile=")) {
            String mobile = URLDecoder.decode(query.split("=")[1], StandardCharsets.UTF_8);
            attributes.put("mobile", mobile);
            System.out.println("[HandshakeInterceptor] Mobile extracted from query: " + mobile);
        } else {
            System.out.println("[HandshakeInterceptor] No mobile found in query: " + uri);
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception ex) {
        if (ex != null) {
            System.err.println("[HandshakeInterceptor] afterHandshake exception: " + ex.getMessage());
        }
    }
}
