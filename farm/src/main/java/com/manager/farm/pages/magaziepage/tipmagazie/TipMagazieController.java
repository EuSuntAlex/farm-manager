package com.manager.farm.pages.magaziepage.tipmagazie;


import com.manager.farm.pages.magaziepage.tipmagazie.commandDto.TipMagazieAddDto;
import com.manager.farm.pages.magaziepage.tipmagazie.commandDto.TipMagazieEditDto;
import com.manager.farm.pages.magaziepage.tipmagazie.querryDto.TipMagazieRepository;
import com.manager.farm.pages.magaziepage.querryDto.MagazieMiscareRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tip-magazie")
@CrossOrigin(origins = "http://localhost:5173")

public class TipMagazieController {

    private final TipMagazieRepository tipMagazieRepository;
    private final MagazieMiscareRepository magazieMiscareRepository;

    public TipMagazieController(
            TipMagazieRepository tipMagazieRepository,
            MagazieMiscareRepository magazieMiscareRepository) {
        this.tipMagazieRepository = tipMagazieRepository;
        this.magazieMiscareRepository = magazieMiscareRepository;
    }

    // 1. CREATE - Adaugă tip nou de magazie
    @PostMapping("/add")
    public ResponseEntity<?> addTipMagazie(@Valid @RequestBody TipMagazieAddDto dto) {
        try {
            // Verifică dacă există deja un tip cu același cod pentru acest user
            if (tipMagazieRepository.existsByUserIdAndCod(dto.getUserId(), dto.getCod())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Există deja un tip cu acest cod");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            TipMagazie tipMagazie = new TipMagazie();
            tipMagazie.setCod(dto.getCod().toUpperCase());
            tipMagazie.setDenumire(dto.getDenumire());
            tipMagazie.setUnitateMasura(dto.getUnitateMasura());
            tipMagazie.setUserId(dto.getUserId());

            TipMagazie saved = tipMagazieRepository.save(tipMagazie);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL - Toate tipurile pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<TipMagazie>> getAllTipuri(@RequestParam Integer userId) {
        List<TipMagazie> tipuri = tipMagazieRepository.findByUserId(userId);
        return ResponseEntity.ok(tipuri);
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTipById(@PathVariable Long id, @RequestParam Integer userId) {
        return tipMagazieRepository.findByUserIdAndId(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTip(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody TipMagazieEditDto dto) {

        return tipMagazieRepository.findByUserIdAndId(userId, id)
                .map(existingTip -> {
                    // Verifică dacă noul cod nu e deja folosit (dacă a fost schimbat)
                    if (dto.getCod() != null && !dto.getCod().equals(existingTip.getCod())) {
                        if (tipMagazieRepository.existsByUserIdAndCod(userId, dto.getCod())) {
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "Există deja un tip cu acest cod");
                            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                        }
                        existingTip.setCod(dto.getCod().toUpperCase());
                    }

                    if (dto.getDenumire() != null) {
                        existingTip.setDenumire(dto.getDenumire());
                    }
                    if (dto.getUnitateMasura() != null) {
                        existingTip.setUnitateMasura(dto.getUnitateMasura());
                    }

                    TipMagazie updated = tipMagazieRepository.save(existingTip);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE - Doar dacă nu are mișcări
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTip(@PathVariable Long id, @RequestParam Integer userId) {
        return tipMagazieRepository.findByUserIdAndId(userId, id)
                .map(tip -> {
                    // Verifică dacă există mișcări pentru acest tip
                    if (magazieMiscareRepository.existsByUserIdAndTipMagazieId(userId, id)) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Nu poți șterge acest tip pentru că există mișcări înregistrate");
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                    }

                    tipMagazieRepository.delete(tip);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Tipul a fost șters cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}