package com.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "audit_messages")
@NoArgsConstructor
@AllArgsConstructor
public class AuditMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_code", unique = true, nullable = false)
    private String messageCode;

    @Column(nullable = false)
    private String message;
}