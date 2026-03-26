package com.backend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "building_cases")
@NoArgsConstructor
@AllArgsConstructor
@Builder 
public class BuildingCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "objekta_adrese", length = 255, nullable = false)
    private String objektaAdrese;

    @Column(name = "sienas_platums_mm", nullable = false)
    private Integer sienasPlatumsMm;

    @Column(name = "sienas_augstums_mm", nullable = false)
    private Integer sienasAugstumsMm;

    @Builder.Default
    @Column(name = "bloka_augstums_mm")
    private Integer blokaAugstumsMm = 200;

    @Builder.Default
    @Column(name = "bloka_garums_mm")
    private Integer blokaGarumsMm = 600;

    @Builder.Default
    @Column(name = "bloka_platums_mm")
    private Integer blokaPlatumsMm = 300;

    @Builder.Default
    @Column(name = "bloka_suves_nobide_mm")
    private Integer blokaSuvesNobideMm = 100;

    @Column(name = "bloku_skaits")
    private Integer blokuSkaits;
}
