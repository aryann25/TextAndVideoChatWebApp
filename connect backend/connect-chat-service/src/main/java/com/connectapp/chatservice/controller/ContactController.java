package com.connectapp.chatservice.controller;

import com.connectapp.chatservice.entity.Contact;
import com.connectapp.chatservice.entity.Message;
import com.connectapp.chatservice.service.ContactService;
import com.connectapp.chatservice.exception.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contacts")
@CrossOrigin
public class ContactController {

    private final ContactService service;
    private final SimpMessagingTemplate messagingTemplate;


    public ContactController(ContactService service,SimpMessagingTemplate messagingTemplate) {
        this.service = service;
        this.messagingTemplate=messagingTemplate;
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Contact request) {
        try {
            boolean added = service.addContact(
                    request.getOwnerPhone(),
                    request.getContactPhone(),
                    request.getContactName()
            );

            if (added) {
                return ResponseEntity.ok(Map.of("message", "Contact added"));
            } else {
                return ResponseEntity.status(409).body(Map.of("message", "Contact already exists"));
            }

        } catch (UserNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", "Contact not registered"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Server error"));
        }
    }

    @GetMapping("/{ownerPhone}")
    public ResponseEntity<List<Contact>> get(@PathVariable String ownerPhone) {
        return ResponseEntity.ok(service.getContacts(ownerPhone));
    }

 // 🔥 FIXED + ENHANCED BLOCK ENDPOINT
    @PatchMapping("/block")
    public ResponseEntity<?> block(
            @RequestParam String owner,
            @RequestParam String contact,
            @RequestParam boolean blocked) {

        try {
            // 1️⃣ Update DB
            service.updateBlocked(owner, contact, blocked);

            // 2️⃣ Create SYSTEM message for OWNER
            Message ownerMsg = new Message();
            ownerMsg.setSenderPhone("SYSTEM");
            ownerMsg.setReceiverPhone(owner);
            ownerMsg.setMessageType("SYSTEM");
            ownerMsg.setStatus("SYSTEM");
            ownerMsg.setContent(
                blocked
                    ? "🚫 You blocked this contact"
                    : "✅ You unblocked this contact"
            );
            ownerMsg.setTimestamp(LocalDateTime.now());

            // 3️⃣ Create SYSTEM message for CONTACT
            Message contactMsg = new Message();
            contactMsg.setSenderPhone("SYSTEM");
            contactMsg.setReceiverPhone(contact);
            contactMsg.setMessageType("SYSTEM");
            contactMsg.setStatus("SYSTEM");
            contactMsg.setContent(
                blocked
                    ? "🚫 You are blocked by this contact"
                    : "✅ You are unblocked by this contact"
            );
            contactMsg.setTimestamp(LocalDateTime.now());

            // 4️⃣ Send via WebSocket
            messagingTemplate.convertAndSendToUser(
                    owner,
                    "/queue/messages",
                    ownerMsg
            );

            messagingTemplate.convertAndSendToUser(
                    contact,
                    "/queue/messages",
                    contactMsg
            );

            return ResponseEntity.ok(
                Map.of(
                    "message", "Block status updated",
                    "blocked", blocked
                )
            );

        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(Map.of("message", "Failed to update block status"));
        }
    }


}
