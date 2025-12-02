package com.connectapp.chatservice.controller;

import com.connectapp.chatservice.entity.Contact;
import com.connectapp.chatservice.service.ContactService;
import com.connectapp.chatservice.exception.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contacts")
@CrossOrigin
public class ContactController {

    private final ContactService service;

    public ContactController(ContactService service) {
        this.service = service;
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
}
