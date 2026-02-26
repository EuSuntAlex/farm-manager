package com.manager.farm.pages.retetaPage.ingredient;

import com.manager.farm.pages.retetaPage.ingredient.commandDto.IngredientAddDto;
import com.manager.farm.pages.retetaPage.ingredient.commandDto.IngredientEditDto;
import com.manager.farm.pages.retetaPage.ingredient.queryDto.IngredientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingrediente")
@CrossOrigin(origins = "*")
public class IngredientController {

    private final IngredientRepository ingredientRepository;

    public IngredientController(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    // 1. CREATE - Adaugă ingredient nou
    @PostMapping("/add")
    public ResponseEntity<?> addIngredient(@Valid @RequestBody IngredientAddDto dto) {
        try {
            // Verifică dacă există deja un ingredient cu același nume pentru acest user
            if (ingredientRepository.existsByUserIdAndName(dto.getUserId(), dto.getName())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Există deja un ingredient cu acest nume");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            Ingredient ingredient = new Ingredient();
            ingredient.setName(dto.getName());
            ingredient.setUnitateMasura(dto.getUnitateMasura());
            ingredient.setPrice(dto.getPrice());
            ingredient.setUserId(dto.getUserId());

            Ingredient saved = ingredientRepository.save(ingredient);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL - Toate ingredientele pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<Ingredient>> getAllIngrediente(@RequestParam Integer userId) {
        List<Ingredient> ingrediente = ingredientRepository.findByUserId(userId);
        return ResponseEntity.ok(ingrediente);
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getIngredientById(@PathVariable Long id, @RequestParam Integer userId) {
        return ingredientRepository.findByUserIdAndId(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateIngredient(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody IngredientEditDto dto) {

        return ingredientRepository.findByUserIdAndId(userId, id)
                .map(existingIngredient -> {
                    // Verifică dacă noul nume nu e deja folosit (dacă a fost schimbat)
                    if (dto.getName() != null && !dto.getName().equals(existingIngredient.getName())) {
                        if (ingredientRepository.existsByUserIdAndName(userId, dto.getName())) {
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "Există deja un ingredient cu acest nume");
                            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                        }
                        existingIngredient.setName(dto.getName());
                    }

                    if (dto.getUnitateMasura() != null) {
                        existingIngredient.setUnitateMasura(dto.getUnitateMasura());
                    }

                    if (dto.getPrice() != null) {
                        existingIngredient.setPrice(dto.getPrice());
                    }

                    Ingredient updated = ingredientRepository.save(existingIngredient);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteIngredient(@PathVariable Long id, @RequestParam Integer userId) {
        return ingredientRepository.findByUserIdAndId(userId, id)
                .map(ingredient -> {
                    ingredientRepository.delete(ingredient);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Ingredientul a fost șters cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. GET - Căutare ingrediente după nume
    @GetMapping("/search")
    public ResponseEntity<List<Ingredient>> searchIngrediente(
            @RequestParam Integer userId,
            @RequestParam String query) {
        List<Ingredient> ingrediente = ingredientRepository.findByUserIdAndNameContaining(userId, query);
        return ResponseEntity.ok(ingrediente);
    }
}