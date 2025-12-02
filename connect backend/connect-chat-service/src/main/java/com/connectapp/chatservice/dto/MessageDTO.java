package com.connectapp.chatservice.dto;

import lombok.Data;

@Data
public class MessageDTO {
    private String tempId; // optional, frontend uses to map messages
    private String receiverPhone;
    private String content;
}
