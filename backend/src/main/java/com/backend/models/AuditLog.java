package com.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Data
@Entity
@Table(name = "audit_logs")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "create_date", insertable = false, updatable = false)
    private OffsetDateTime createDate;

    @Column(nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON) 
    @Column(columnDefinition = "jsonb")
    private String dataset; 
}