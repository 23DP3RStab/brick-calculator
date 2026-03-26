package com.backend.repository;

import com.backend.models.BuildingCase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingCaseRepository extends JpaRepository<BuildingCase, Long> {
    
}