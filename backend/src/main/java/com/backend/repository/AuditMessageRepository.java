package com.backend.repository;

import com.backend.models.AuditMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AuditMessageRepository extends JpaRepository<AuditMessage, Long> {
    Optional<AuditMessage> findByMessageCode(String messageCode);
}