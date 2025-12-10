package com.connectapp.chatservice.repository;

import com.connectapp.chatservice.entity.Contact;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByOwnerPhone(String ownerPhone);
    boolean existsByOwnerPhoneAndContactPhone(String ownerPhone, String contactPhone);
    
    @Modifying
    @Transactional
    @Query("UPDATE Contact c SET c.blocked = :blocked WHERE c.ownerPhone = :owner AND c.contactPhone = :contact")
    void updateBlocked(String owner, String contact, boolean blocked);

}
