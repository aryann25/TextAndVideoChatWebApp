package com.connectapp.videoservice.dto;

import lombok.Data;

@Data
public class SignalMessage {
    private String type; // offer | answer | candidate
    private String from;
    private String to;
    private Object data;
}
