package com.manager.farm.pages.bovinePage.tipBovina;

import com.manager.farm.pages.bovinePage.queryDto.BovinaRepository;
import com.manager.farm.pages.bovinePage.tipBovina.commandDto.TipBovinaAddDto;
import com.manager.farm.pages.bovinePage.tipBovina.commandDto.TipBovinaEditDto;
import com.manager.farm.pages.bovinePage.tipBovina.queryDto.TipBovinaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tip-bovina")
@CrossOrigin(origins = "*")
public class TipBovinaController {

    private final TipBovinaRepository tipBovinaRepository;
    private final BovinaRepository bovinaRepository;

    public TipBovinaController(
            TipBovinaRepository tipBovinaRepository,
            BovinaRepository bovinaRepository) {
        this.tipBovinaRepository = tipBovinaRepository;
        this.bovinaRepository = bovinaRepository;
    }

    // 1. CREATE - Adaugă rasă nouă
    @PostMapping("/add")
    public ResponseEntity<?> addTipBovina(@Valid @RequestBody TipBovinaAddDto dto) {
        try {
            // Verifică dacă există deja o rasă cu același nume pentru acest user
            if (tipBovinaRepository.existsByUserIdAndName(dto.getUserId(), dto.getName())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Există deja o rasă cu acest nume");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            TipBovina tipBovina = new TipBovina();
            tipBovina.setName(dto.getName());
            tipBovina.setDefaultRetetaId(dto.getDefaultRetetaId());
            tipBovina.setUserId(dto.getUserId());

            TipBovina saved = tipBovinaRepository.save(tipBovina);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL - Toate rasele pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<TipBovina>> getAllTipBovina(@RequestParam Integer userId) {
        List<TipBovina> tipuri = tipBovinaRepository.findByUserId(userId);
        return ResponseEntity.ok(tipuri);
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTipBovinaById(@PathVariable Long id, @RequestParam Integer userId) {
        return tipBovinaRepository.findByUserIdAndId(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTipBovina(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody TipBovinaEditDto dto) {

        return tipBovinaRepository.findByUserIdAndId(userId, id)
                .map(existingTip -> {
                    // Verifică dacă noul nume nu e deja folosit (dacă a fost schimbat)
                    if (dto.getName() != null && !dto.getName().equals(existingTip.getName())) {
                        if (tipBovinaRepository.existsByUserIdAndName(userId, dto.getName())) {
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "Există deja o rasă cu acest nume");
                            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                        }
                        existingTip.setName(dto.getName());
                    }

                    if (dto.getDefaultRetetaId() != null) {
                        existingTip.setDefaultRetetaId(dto.getDefaultRetetaId());
                    }

                    TipBovina updated = tipBovinaRepository.save(existingTip);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE - Doar dacă nu există bovine care folosesc această rasă
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTipBovina(@PathVariable Long id, @RequestParam Integer userId) {
        return tipBovinaRepository.findByUserIdAndId(userId, id)
                .map(tip -> {
                    // Verifică dacă există bovine cu această rasă
                    if (bovinaRepository.existsByUserIdAndTipBovinaId(userId, id)) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Nu poți șterge această rasă pentru că există bovine înregistrate cu această rasă");
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                    }

                    tipBovinaRepository.delete(tip);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Rasa a fost ștearsă cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. SEARCH - Căutare rase după nume
    @GetMapping("/search")
    public ResponseEntity<List<TipBovina>> searchTipBovina(
            @RequestParam Integer userId,
            @RequestParam String query) {
        List<TipBovina> tipuri = tipBovinaRepository.findByUserIdAndNameContaining(userId, query);
        return ResponseEntity.ok(tipuri);
    }
}