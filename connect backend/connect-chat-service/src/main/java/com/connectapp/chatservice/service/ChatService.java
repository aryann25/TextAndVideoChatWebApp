package com.connectapp.chatservice.service;

import com.connectapp.chatservice.entity.Message;
import com.connectapp.chatservice.repository.MessageRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository repository;

    /** Save message in DB and optionally send via WebSocket */
    public Message sendMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        message.setStatus("SENT");

        Message saved = repository.save(message);

        return saved;
    }

    /** Fetch chat history between two mobile numbers */
    public List<Message> getChatHistory(String senderPhone, String receiverPhone) {
        return repository.findChatHistory(senderPhone, receiverPhone);
    }
    
    @Transactional
    public void clearChat(String user, String contact) {
        repository.deleteChatHistory(user, contact);
    }

}
