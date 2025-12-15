package com.connectapp.chatservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(value = { "id" }, allowGetters = true)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Transient
    private String clientTempId;

    private String senderPhone;
    private String receiverPhone;
    private String content;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String status;
 // New fields for file support
    private String messageType = "TEXT"; // TEXT, IMAGE, VIDEO, PDF, DOCUMENT,SYSTEM
    private String fileName;
    
    @Column(length = 500)
    private String fileUrl;
    

}
