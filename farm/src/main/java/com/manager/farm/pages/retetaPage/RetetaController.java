package com.manager.farm.pages.retetaPage;

import com.manager.farm.pages.retetaPage.commandDto.RetetaAddDto;
import com.manager.farm.pages.retetaPage.commandDto.RetetaEditDto;
import com.manager.farm.pages.retetaPage.queryDto.RetetaResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/retete")
@CrossOrigin(origins = "*")
public class RetetaController {

    private final RetetaService retetaService;

    public RetetaController(RetetaService retetaService) {
        this.retetaService = retetaService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addReteta(@Valid @RequestBody RetetaAddDto dto) {
        try {
            retetaService.createReteta(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(retetaService.getRetetaById(
                            retetaService.getAllRetete(dto.getUserId()).get(0).getId(),
                            dto.getUserId()));
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

    @GetMapping("/all")
    public ResponseEntity<List<RetetaResponseDto>> getAllRetete(@RequestParam Integer userId) {
        return ResponseEntity.ok(retetaService.getAllRetete(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRetetaById(@PathVariable Long id, @RequestParam Integer userId) {
        RetetaResponseDto reteta = retetaService.getRetetaById(id, userId);
        if (reteta == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(reteta);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateReteta(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody RetetaEditDto dto) {
        try {
            retetaService.updateReteta(id, userId, dto);
            return ResponseEntity.ok(retetaService.getRetetaById(id, userId));
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
    public ResponseEntity<?> deleteReteta(@PathVariable Long id, @RequestParam Integer userId) {
        try {
            retetaService.deleteReteta(id, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Rețeta a fost ștearsă cu succes");
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

    @GetMapping("/by-ingredient/{ingredientId}")
    public ResponseEntity<List<RetetaResponseDto>> getReteteByIngredient(
            @PathVariable Long ingredientId,
            @RequestParam Integer userId) {
        return ResponseEntity.ok(retetaService.getReteteByIngredient(ingredientId, userId));
    }
}