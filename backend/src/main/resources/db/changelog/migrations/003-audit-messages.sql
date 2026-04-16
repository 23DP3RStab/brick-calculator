--liquibase formatted sql

--changeset admin:create-audit-messages-table
CREATE TABLE audit_messages (
    id SERIAL PRIMARY KEY,
    message_code VARCHAR(50) UNIQUE NOT NULL,
    message TEXT NOT NULL
);

CREATE INDEX idx_audit_messages_code ON audit_messages(message_code);

--changeset admin:insert-default-audit-messages
INSERT INTO audit_messages (message_code, message) VALUES 
('ENTITY_CREATED', 'Jauns ieraksts tika izveidots sistēmā.'),
('ENTITY_UPDATED', 'Esošs ieraksts tika modificēts.'),
('ENTITY_DELETED', 'Ieraksts tika neatgriezeniski dzēsts no sistēmas.');