package com.connectapp.chatservice.controller;

import com.connectapp.chatservice.entity.Contact;
import com.connectapp.chatservice.entity.Message;
import com.connectapp.chatservice.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/contacts")
public class ContactController {

    private final ContactService service;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Contact request) {

        boolean added = service.addContact(
                request.getOwnerPhone(),
                request.getContactPhone(),
                request.getContactName()
        );

        return added
                ? ResponseEntity.ok(Map.of("message", "Contact added"))
                : ResponseEntity.status(409).body(Map.of("message", "Already exists"));
    }

    @GetMapping("/{owner}")
    public List<Contact> get(@PathVariable String owner) {
        return service.getContacts(owner);
    }

    @PatchMapping("/block")
    public ResponseEntity<?> block(
            @RequestParam String owner,
            @RequestParam String contact,
            @RequestParam boolean blocked) {

        service.updateBlocked(owner, contact, blocked);

        Message msg = new Message();
        msg.setSenderPhone("SYSTEM");
        msg.setReceiverPhone(owner);
        msg.setMessageType("SYSTEM");
        msg.setContent(blocked ? "🚫 Contact blocked" : "✅ Contact unblocked");
        msg.setTimestamp(LocalDateTime.now());

        messagingTemplate.convertAndSendToUser(owner, "/queue/messages", msg);

        return ResponseEntity.ok(Map.of("blocked", blocked));
    }
}
