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
}