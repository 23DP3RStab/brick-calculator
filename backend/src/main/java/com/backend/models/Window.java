package com.backend.models;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
@Table(name = "windows")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Window {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "width_mm")
    private Integer widthMm;

    @Column(name = "height_mm")
    private Integer heightMm;

    @Column(name = "x_mm")
    private Integer xMm;

    @Column(name = "y_mm")
    private Integer yMm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_case_id")
    @JsonBackReference
    @ToString.Exclude
    private BuildingCase buildingCase;
}