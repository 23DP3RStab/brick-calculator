package com.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.backend.models.BuildingCase;
import com.backend.models.Window;
import com.backend.repository.BuildingCaseRepository;

import java.util.List;

@RestController
@RequestMapping("/api/building-cases")
@Transactional
public class BuildingCaseController {

    @Autowired
    private BuildingCaseRepository repository;

    private void syncWindows(BuildingCase buildingCase) {
        if (buildingCase.getWindows() != null) {
            for (Window window : buildingCase.getWindows()) {
                window.setBuildingCase(buildingCase);
            }
        }
    }

    @PostMapping
    public BuildingCase createBuildingCase(@RequestBody BuildingCase buildingCase) {
        syncWindows(buildingCase);
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
            
            existingCase.getWindows().clear();
            if (updatedCase.getWindows() != null) {
                for (Window w : updatedCase.getWindows()) {
                    w.setBuildingCase(existingCase);
                    existingCase.getWindows().add(w);
                }
            }
            
            return repository.save(existingCase);
        }).orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}