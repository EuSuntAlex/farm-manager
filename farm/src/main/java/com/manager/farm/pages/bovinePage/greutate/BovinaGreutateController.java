package com.manager.farm.pages.bovinePage.greutate;

import com.manager.farm.pages.bovinePage.greutate.commandDto.BovinaGreutateAddDto;
import com.manager.farm.pages.bovinePage.greutate.queryDto.BovinaGreutateResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bovine/greutate")
@CrossOrigin(origins = "*")
public class BovinaGreutateController {

    private final BovinaGreutateService greutateService;

    public BovinaGreutateController(BovinaGreutateService greutateService) {
        this.greutateService = greutateService;
    }

    // Adaugă o nouă măsurătoare
    @PostMapping("/add")
    public ResponseEntity<?> addMasuratoare(@Valid @RequestBody BovinaGreutateAddDto dto) {
        try {
            var saved = greutateService.addMasuratoare(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Istoric complet pentru o bovină
    @GetMapping("/istoric/{bovinaId}")
    public ResponseEntity<?> getIstoric(
            @PathVariable Long bovinaId,
            @RequestParam Integer userId) {
        try {
            List<BovinaGreutateResponseDto> istoric =
                    greutateService.getIstoricGreutate(bovinaId, userId);
            return ResponseEntity.ok(istoric);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Ultima măsurătoare (greutatea curentă)
    @GetMapping("/ultima/{bovinaId}")
    public ResponseEntity<?> getUltimaMasuratoare(
            @PathVariable Long bovinaId,
            @RequestParam Integer userId) {
        try {
            var istoric = greutateService.getIstoricGreutate(bovinaId, userId);
            if (istoric.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(istoric.get(istoric.size() - 1));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Șterge o măsurătoare
    @DeleteMapping("/delete/{masuratoareId}")
    public ResponseEntity<?> deleteMasuratoare(
            @PathVariable Long masuratoareId,
            @RequestParam Long bovinaId,
            @RequestParam Integer userId) {
        try {
            greutateService.deleteMasuratoare(masuratoareId, bovinaId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Măsurătoarea a fost ștearsă cu succes");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}