package com.connectapp.chatservice.service;

import com.connectapp.chatservice.entity.Contact;
import com.connectapp.chatservice.exception.UserNotFoundException;
import com.connectapp.chatservice.repository.ContactRepository;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ContactService {

    private final ContactRepository repo;
    private final RestTemplate restTemplate;

    public ContactService(ContactRepository repo, RestTemplate restTemplate) {
        this.repo = repo;
        this.restTemplate = restTemplate;
    }

    public boolean addContact(String ownerPhone, String contactPhone, String contactName) {

        // 1️⃣ Check if contact user exists in Auth Service
        String url = "http://localhost:8081/auth/user/exists/" + contactPhone;
        Boolean exists = restTemplate.getForObject(url, Boolean.class);

        if (exists == null || !exists) {
            throw new UserNotFoundException("User not registered");
        }

        // 2️⃣ Check duplicate
        if (repo.existsByOwnerPhoneAndContactPhone(ownerPhone, contactPhone)) {
            return false;
        }

        // 3️⃣ Save
        repo.save(new Contact(ownerPhone, contactPhone, contactName));
        return true;
    }

    public List<Contact> getContacts(String ownerPhone) {
        return repo.findByOwnerPhone(ownerPhone);
    }

    // 🔥 UPDATED METHOD NAME
    @Transactional
    public void updateBlocked(String owner, String contact, boolean blocked) {
        repo.updateBlocked(owner, contact, blocked);
        repo.flush(); // ensures immediate DB update
    }
    
    public boolean isBlocked(String sender, String receiver) {
        Contact contact = repo.findContact(receiver, sender);
        return contact != null && contact.isBlocked();
    }
    
    public boolean isBlockedEitherWay(String userA, String userB) {
        Contact aToB = repo.findContact(userA, userB);
        Contact bToA = repo.findContact(userB, userA);

        return (aToB != null && aToB.isBlocked())
            || (bToA != null && bToA.isBlocked());
    }
    
    public boolean isBlockedEitherSide(String a, String b) {
        return repo.findBlocked(a, b) != null || repo.findBlocked(b, a) != null;
    }



}
