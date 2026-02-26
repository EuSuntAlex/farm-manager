package com.manager.farm.pages.retetaPage.retetaIngredient;

import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientAddDto;
import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientEditDto;
import com.manager.farm.pages.retetaPage.retetaIngredient.queryDto.RetetaIngredientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reteta-ingrediente")
@CrossOrigin(origins = "*")
public class RetetaIngredientController {

    private final RetetaIngredientService retetaIngredientService;
    private final RetetaIngredientRepository retetaIngredientRepository;

    public RetetaIngredientController(RetetaIngredientService retetaIngredientService, RetetaIngredientRepository retetaIngredientRepository) {
        this.retetaIngredientService = retetaIngredientService;
        this.retetaIngredientRepository = retetaIngredientRepository;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addRetetaIngredient(@Valid @RequestBody RetetaIngredientAddDto dto) {
        try {
            RetetaIngredient saved = retetaIngredientService.createRetetaIngredient(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/by-reteta/{retetaId}")
    public ResponseEntity<List<RetetaIngredient>> getByRetetaId(@PathVariable Long retetaId) {
        return ResponseEntity.ok(retetaIngredientService.getByRetetaId(retetaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return retetaIngredientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateRetetaIngredient(
            @PathVariable Long id,
            @Valid @RequestBody RetetaIngredientEditDto dto) {
        try {
            RetetaIngredient updated = retetaIngredientService.updateRetetaIngredient(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la actualizare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteRetetaIngredient(@PathVariable Long id) {
        try {
            retetaIngredientService.deleteRetetaIngredient(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Legătura a fost ștearsă cu succes");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la ștergere: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}