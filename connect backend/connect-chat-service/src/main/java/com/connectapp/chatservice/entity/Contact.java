package com.connectapp.chatservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ownerPhone;
    private String contactPhone;
    private String contactName;
    private boolean blocked = false;


    // Optional: convenience constructor without id
    public Contact(String ownerPhone, String contactPhone, String contactName) {
        this.ownerPhone = ownerPhone;
        this.contactPhone = contactPhone;
        this.contactName = contactName;
    }
}
