--liquibase formatted sql

--changeset admin:create-audit-table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    create_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT NOT NULL,
    dataset JSONB
);