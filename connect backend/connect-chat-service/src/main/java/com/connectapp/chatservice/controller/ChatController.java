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

        // Clear temporary id sent from frontend
        message.setId(null);

        // Determine sender from Principal (set via handshake)
        String senderPhone = (principal != null && principal.getName() != null)
                ? principal.getName()
                : message.getSenderPhone();
        message.setSenderPhone(senderPhone);
        message.setStatus("SENT");

        // Save message in DB
        Message saved = chatService.sendMessage(message);

        // Keep tempId to map frontend optimistic message
        saved.setClientTempId(message.getClientTempId());

        // Send message to receiver
        messagingTemplate.convertAndSendToUser(
                saved.getReceiverPhone(),
                "/queue/messages",
                saved
        );

        // ✅ Send message to sender as well, so it appears in sender's chat
        messagingTemplate.convertAndSendToUser(
                saved.getSenderPhone(),
                "/queue/messages",
                saved
        );
    }


    // 🔹 Fetch message history
    @GetMapping("/history/{contactPhone}")
    public List<Message> getHistory(@PathVariable String contactPhone,
                                    @RequestHeader("X-Mobile") String loggedInPhone) {

        // prevent same phone fetch
        if (loggedInPhone.equals(contactPhone)) {
            return List.of();
        }

        return chatService.getChatHistory(loggedInPhone, contactPhone);
    }
    
 // 🔹 Clear Chat API
    @DeleteMapping("/clear/{contactPhone}")
    public void clearChat(@PathVariable String contactPhone,
                          @RequestHeader("X-Mobile") String loggedInPhone) {
        chatService.clearChat(loggedInPhone, contactPhone);
    }


}
