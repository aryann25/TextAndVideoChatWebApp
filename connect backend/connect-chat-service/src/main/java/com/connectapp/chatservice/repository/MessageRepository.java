package com.connectapp.chatservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import com.connectapp.chatservice.entity.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderPhone = :sender AND m.receiverPhone = :receiver) OR " +
           "(m.senderPhone = :receiver AND m.receiverPhone = :sender) " +
           "ORDER BY m.timestamp ASC")
    List<Message> findChatHistory(String sender, String receiver);
    
    @Modifying
    @Query("DELETE FROM Message m WHERE " +
           "(m.senderPhone = :user AND m.receiverPhone = :contact) OR " +
           "(m.senderPhone = :contact AND m.receiverPhone = :user)")
    void deleteChatHistory(String user, String contact);

}
