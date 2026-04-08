package com.backend.controller;

import com.backend.models.BuildingCase;
import com.backend.repository.BuildingCaseRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BuildingCaseControllerTest {

    @Mock
    private BuildingCaseRepository repository;

    @InjectMocks
    private BuildingCaseController controller;

    @Test
    @DisplayName("Create: should call repository save and return the saved entity")
    void shouldSaveAndReturnNewBuildingCase() {
        BuildingCase input = BuildingCase.builder()
                .objektaAdrese("Rīga, Brīvības 1")
                .sienasPlatumsMm(5000)
                .build();

        BuildingCase saved = BuildingCase.builder()
                .id(1L)
                .objektaAdrese("Rīga, Brīvības 1")
                .sienasPlatumsMm(5000)
                .build();

        when(repository.save(input)).thenReturn(saved);

        BuildingCase result = controller.createBuildingCase(input);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Rīga, Brīvības 1", result.getObjektaAdrese());
        verify(repository, times(1)).save(input);
    }

    @Test
    @DisplayName("GetAll: should call repository findAll and return list of cases")
    void shouldReturnAllBuildingCases() {
        List<BuildingCase> mockCases = List.of(
            BuildingCase.builder().id(1L).objektaAdrese("Adrese 1").build(),
            BuildingCase.builder().id(2L).objektaAdrese("Adrese 2").build()
        );
        when(repository.findAll()).thenReturn(mockCases);

        List<BuildingCase> result = controller.getAll();

        assertEquals(2, result.size());
        assertEquals("Adrese 1", result.get(0).getObjektaAdrese());
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("GetById: should return case when ID exists")
    void shouldReturnCaseWhenIdExists() {
        Long targetId = 1L;
        BuildingCase mockCase = BuildingCase.builder().id(targetId).objektaAdrese("Atrasts").build();
        when(repository.findById(targetId)).thenReturn(Optional.of(mockCase));

        BuildingCase result = controller.getById(targetId);

        assertNotNull(result);
        assertEquals(targetId, result.getId());
        verify(repository, times(1)).findById(targetId);
    }

    @Test
    @DisplayName("GetById: should throw RuntimeException when ID does not exist")
    void shouldThrowExceptionWhenIdNotFound() {
        Long targetId = 99L;
        when(repository.findById(targetId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            controller.getById(targetId);
        });

        assertTrue(exception.getMessage().contains("Case not found with id: 99"));
        verify(repository, times(1)).findById(targetId);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Update: should copy all incoming fields to existing entity before saving")
    void shouldUpdateAllFieldsWhenCaseExists() {
        Long targetId = 1L;
        BuildingCase existing = BuildingCase.builder()
                .id(targetId)
                .objektaAdrese("Old Address")
                .sienasPlatumsMm(1000)
                .logaPlatumsMm(0)
                .build();

        BuildingCase updatedInfo = BuildingCase.builder()
                .objektaAdrese("New Address")
                .sienasPlatumsMm(9999)
                .sienasAugstumsMm(5555)
                .blokaGarumsMm(600)
                .blokaAugstumsMm(200)
                .blokaPlatumsMm(300)
                .blokaSuvesNobideMm(100)
                .blokuSkaits(500)
                .logaPlatumsMm(1500)
                .logaAugstumsMm(1200)
                .logaXMm(500)
                .logaYMm(400)
                .build();

        when(repository.findById(targetId)).thenReturn(Optional.of(existing));
        when(repository.save(any(BuildingCase.class))).thenAnswer(i -> i.getArgument(0));

        BuildingCase result = controller.update(targetId, updatedInfo);

        assertAll("Verify all fields were copied correctly",
            () -> assertEquals("New Address", result.getObjektaAdrese()),
            () -> assertEquals(9999, result.getSienasPlatumsMm()),
            () -> assertEquals(5555, result.getSienasAugstumsMm()),
            () -> assertEquals(500, result.getBlokuSkaits()),
            () -> assertEquals(1500, result.getLogaPlatumsMm()),
            () -> assertEquals(1200, result.getLogaAugstumsMm()),
            () -> assertEquals(500, result.getLogaXMm()),
            () -> assertEquals(400, result.getLogaYMm())
        );

        verify(repository).findById(targetId);
        verify(repository).save(existing);
    }
}