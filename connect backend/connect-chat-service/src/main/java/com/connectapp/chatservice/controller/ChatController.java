package com.connectapp.chatservice.controller;

import com.connectapp.chatservice.entity.Message;
import com.connectapp.chatservice.service.ChatService;
import com.connectapp.chatservice.service.ContactService;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatController {

    private final ChatService chatService;
    private final ContactService contactService;
    private final SimpMessagingTemplate messagingTemplate;
    private static final String UPLOAD_DIR = "uploads/";

    @MessageMapping("/send")
    public void send(Message message, Principal principal) {

    	if (principal == null) return;
    	String sender = principal.getName();

        String receiver = message.getReceiverPhone();

        // 🔥 BLOCK CHECK
        if (contactService.isBlockedEitherWay(sender, receiver)) {

            Message toSender = new Message();
            toSender.setSenderPhone("SYSTEM");
            toSender.setReceiverPhone(sender);
            toSender.setMessageType("SYSTEM");
            toSender.setContent("🚫 You cannot send messages. This chat is blocked.");
            toSender.setTimestamp(LocalDateTime.now());
            toSender.setStatus("BLOCKED");

            Message toReceiver = new Message();
            toReceiver.setSenderPhone("SYSTEM");
            toReceiver.setReceiverPhone(receiver);
            toReceiver.setMessageType("SYSTEM");
            toReceiver.setContent("🚫 This user attempted to message you, but the chat is blocked.");
            toReceiver.setTimestamp(LocalDateTime.now());
            toReceiver.setStatus("BLOCKED");

            messagingTemplate.convertAndSendToUser(sender, "/queue/messages", toSender);
            messagingTemplate.convertAndSendToUser(receiver, "/queue/messages", toReceiver);

            return;
        }


        // normal flow
        message.setSenderPhone(sender);
        message.setStatus("SENT");

        Message saved = chatService.sendMessage(message);

        messagingTemplate.convertAndSendToUser(receiver, "/queue/messages", saved);
        messagingTemplate.convertAndSendToUser(sender, "/queue/messages", saved);
    }



    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("senderPhone") String senderPhone,
            @RequestParam("receiverPhone") String receiverPhone,
            @RequestHeader("X-Mobile") String loggedInPhone) {
    	
    	if (contactService.isBlockedEitherWay(senderPhone, receiverPhone)) {
    	    return ResponseEntity
    	            .status(403)
    	            .body(Map.of("message", "Messaging is blocked"));
    	}
        
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(filePath, file.getBytes());

            String messageType = getMessageType(file.getContentType());
            String fileUrl = "/uploads/" + uniqueFilename;

            Message message = new Message();
            message.setSenderPhone(senderPhone);
            message.setReceiverPhone(receiverPhone);
            message.setContent(fileUrl);
            message.setMessageType(messageType);
            message.setFileName(originalFilename);
            message.setFileUrl(fileUrl);
            message.setTimestamp(LocalDateTime.now());
            message.setStatus("SENT");

            Message saved = chatService.sendMessage(message);

            messagingTemplate.convertAndSendToUser(
                    receiverPhone,
                    "/queue/messages",
                    saved
            );

            messagingTemplate.convertAndSendToUser(
                    senderPhone,
                    "/queue/messages",
                    saved
            );

            return ResponseEntity.ok(Map.of(
                "id", saved.getId(),
                "fileName", originalFilename,
                "fileUrl", fileUrl,
                "messageType", messageType,
                "message", "File uploaded successfully"
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload file"));
        }
    }

    // NEW: Download endpoint for files
    @GetMapping("/download/**")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(path).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String getMessageType(String contentType) {
        if (contentType == null) return "DOCUMENT";
        if (contentType.startsWith("image/")) return "IMAGE";
        if (contentType.startsWith("video/")) return "VIDEO";
        if (contentType.contains("pdf")) return "PDF";
        return "DOCUMENT";
    }

    @GetMapping("/history/{contactPhone}")
    public List<Message> getHistory(@PathVariable String contactPhone,
                                    @RequestHeader("X-Mobile") String loggedInPhone) {
        if (loggedInPhone.equals(contactPhone)) {
            return List.of();
        }
        return chatService.getChatHistory(loggedInPhone, contactPhone);
    }

    @DeleteMapping("/clear/{contactPhone}")
    public void clearChat(@PathVariable String contactPhone,
                          @RequestHeader("X-Mobile") String loggedInPhone) {
        chatService.clearChat(loggedInPhone, contactPhone);
    }
}