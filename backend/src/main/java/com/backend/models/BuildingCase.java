package com.backend.models;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "pilnie_bloki")
    private Integer pilnieBloki;

    @Column(name = "sagrieztie_bloki")
    private Integer sagrieztieBloki;

    @OneToMany(mappedBy = "buildingCase", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    @JsonProperty("windows")
    private List<Window> windows = new ArrayList<>();

    @JsonProperty("loguSkaits")
    public int getLoguSkaits() {
        return windows != null ? windows.size() : 0;
    }
}