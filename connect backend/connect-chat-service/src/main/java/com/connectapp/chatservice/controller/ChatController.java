package com.connectapp.chatservice.controller;

import com.connectapp.chatservice.entity.Message;
import com.connectapp.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 🔹 Send message (via WebSocket)
    @MessageMapping("/send")
    public void send(Message message, Principal principal) {

        // Prevent tmp-id from frontend
        message.setId(null);

        String senderPhone = (principal != null && principal.getName() != null)
                ? principal.getName()
                : message.getSenderPhone();

        message.setSenderPhone(senderPhone);
        message.setStatus("SENT");

        Message saved = chatService.sendMessage(message);

        // return the real DB id with same tempId
        saved.setClientTempId(message.getClientTempId());

        messagingTemplate.convertAndSendToUser(
                saved.getReceiverPhone(),
                "/queue/messages",
                saved
        );
    }


    // 🔹 Fetch message history
    @GetMapping("/history/{contactPhone}")
    public List<Message> getHistory(@PathVariable String contactPhone, Principal principal) {
        String senderPhone = (principal != null && principal.getName() != null)
                ? principal.getName()
                : "3456789123";
        return chatService.getChatHistory(senderPhone, contactPhone);
    }
}
