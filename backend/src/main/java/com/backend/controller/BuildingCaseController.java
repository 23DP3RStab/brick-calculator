package com.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.backend.models.BuildingCase;
import com.backend.repository.BuildingCaseRepository;

import java.util.List;

@RestController
@RequestMapping("/api/building-cases")
public class BuildingCaseController {

    @Autowired
    private BuildingCaseRepository repository;

    @PostMapping
    public BuildingCase createBuildingCase(@RequestBody BuildingCase buildingCase) {
        return repository.save(buildingCase);
    }

    @GetMapping
    public List<BuildingCase> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public BuildingCase getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
    }

    @PutMapping("/{id}")
    public BuildingCase update(@PathVariable Long id, @RequestBody BuildingCase updatedCase) {
        return repository.findById(id).map(existingCase -> {
            existingCase.setObjektaAdrese(updatedCase.getObjektaAdrese());
            existingCase.setSienasPlatumsMm(updatedCase.getSienasPlatumsMm());
            existingCase.setSienasAugstumsMm(updatedCase.getSienasAugstumsMm());
            existingCase.setBlokaAugstumsMm(updatedCase.getBlokaAugstumsMm());
            existingCase.setBlokaGarumsMm(updatedCase.getBlokaGarumsMm());
            existingCase.setBlokaPlatumsMm(updatedCase.getBlokaPlatumsMm());
            existingCase.setBlokaSuvesNobideMm(updatedCase.getBlokaSuvesNobideMm());
            existingCase.setBlokuSkaits(updatedCase.getBlokuSkaits());
            
            existingCase.setLogaPlatumsMm(updatedCase.getLogaPlatumsMm());
            existingCase.setLogaAugstumsMm(updatedCase.getLogaAugstumsMm());
            existingCase.setLogaXMm(updatedCase.getLogaXMm());
            existingCase.setLogaYMm(updatedCase.getLogaYMm());
            
            return repository.save(existingCase);
        }).orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}