package com.connectapp.chatservice.repository;

import com.connectapp.chatservice.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByOwnerPhone(String ownerPhone);
    boolean existsByOwnerPhoneAndContactPhone(String ownerPhone, String contactPhone);
}
