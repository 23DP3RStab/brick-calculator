package com.backend.service;

import com.backend.models.AuditLog;
import com.backend.models.AuditMessage;
import com.backend.repository.AuditLogRepository;
import com.backend.repository.AuditMessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditMessageRepository auditMessageRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public void logAction(String messageCode, Object data) {
        String description = auditMessageRepository.findByMessageCode(messageCode)
                .map(AuditMessage::getMessage)
                .orElse("Nezināma darbība: " + messageCode);

        try {
            String jsonDataset = objectMapper.writeValueAsString(data);

            AuditLog log = AuditLog.builder()
                    .description(description)
                    .dataset(jsonDataset)
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Auditēšanas kļūda: " + e.getMessage());
        }
    }
}