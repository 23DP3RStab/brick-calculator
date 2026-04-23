package com.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import com.backend.models.BuildingCase;
import com.backend.models.Window;
import com.backend.repository.BuildingCaseRepository;
import com.backend.service.AuditService;
import java.util.List;

@RestController
@RequestMapping("/api")
@Transactional
public class BuildingCaseController {

    @Autowired
    private BuildingCaseRepository repository;

    @Autowired
    private AuditService auditService;

    @GetMapping("/auth/me")
    public Authentication getMe(Authentication authentication) {
        return authentication;
    }

    @GetMapping("/building-cases")
    public List<BuildingCase> getAll() {
        return repository.findAll();
    }

    @PostMapping("/building-cases")
    public BuildingCase createBuildingCase(@RequestBody BuildingCase buildingCase) {
        auditService.logAction("ENTITY_CREATED", buildingCase);
        syncWindows(buildingCase);
        return repository.save(buildingCase);
    }

    @GetMapping("/building-cases/{id}")
    public BuildingCase getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Case not found with id: " + id));
    }

    @PutMapping("/building-cases/{id}")
    public BuildingCase update(@PathVariable Long id, @RequestBody BuildingCase updatedCase) {
        return repository.findById(id).map(existingCase -> {
            auditService.logAction("ENTITY_UPDATED", updatedCase);
            existingCase.setObjektaAdrese(updatedCase.getObjektaAdrese());
            existingCase.setSienasPlatumsMm(updatedCase.getSienasPlatumsMm());
            existingCase.setSienasAugstumsMm(updatedCase.getSienasAugstumsMm());
            existingCase.setBlokaAugstumsMm(updatedCase.getBlokaAugstumsMm());
            existingCase.setBlokaGarumsMm(updatedCase.getBlokaGarumsMm());
            existingCase.setBlokaPlatumsMm(updatedCase.getBlokaPlatumsMm());
            existingCase.setBlokaSuvesNobideMm(updatedCase.getBlokaSuvesNobideMm());
            existingCase.setBlokuSkaits(updatedCase.getBlokuSkaits());
            existingCase.setPilnieBloki(updatedCase.getPilnieBloki());
            existingCase.setSagrieztieBloki(updatedCase.getSagrieztieBloki());
            
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

    @DeleteMapping("/building-cases/{id}")
    public void delete(@PathVariable Long id) {
        repository.findById(id).ifPresent(caseToDelete -> {
            auditService.logAction("ENTITY_DELETED", caseToDelete);
        });
        repository.deleteById(id);
    }

    private void syncWindows(BuildingCase buildingCase) {
        if (buildingCase.getWindows() != null) {
            for (Window window : buildingCase.getWindows()) {
                window.setBuildingCase(buildingCase);
            }
        }
    }
}