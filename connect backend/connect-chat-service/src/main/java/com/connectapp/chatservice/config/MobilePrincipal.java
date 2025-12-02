package com.connectapp.chatservice.config;

import java.security.Principal;

public class MobilePrincipal implements Principal {
    private final String name;

    public MobilePrincipal(String mobile) {
        this.name = mobile;
    }

    @Override
    public String getName() {
        return name;
    }
}
