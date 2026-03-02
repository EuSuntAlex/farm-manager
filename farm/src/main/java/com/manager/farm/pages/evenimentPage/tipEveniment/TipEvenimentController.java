package com.manager.farm.pages.evenimentPage.tipEveniment;

import com.manager.farm.pages.evenimentPage.queryDto.EvenimentRepository;
import com.manager.farm.pages.evenimentPage.tipEveniment.commandDto.TipEvenimentAddDto;
import com.manager.farm.pages.evenimentPage.tipEveniment.commandDto.TipEvenimentEditDto;
import com.manager.farm.pages.evenimentPage.tipEveniment.queryDto.TipEvenimentRepository;
import com.manager.farm.pages.evenimentPage.tipEveniment.service.TipEvenimentInitializareService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tip-eveniment")
@CrossOrigin(origins = "*")
public class TipEvenimentController {

    private final TipEvenimentRepository tipEvenimentRepository;
    private final EvenimentRepository evenimentRepository;
    private final TipEvenimentInitializareService initializareService;

    public TipEvenimentController(
            TipEvenimentRepository tipEvenimentRepository,
            EvenimentRepository evenimentRepository,
            TipEvenimentInitializareService initializareService) {
        this.tipEvenimentRepository = tipEvenimentRepository;
        this.evenimentRepository = evenimentRepository;
        this.initializareService = initializareService;
    }

    // 1. CREATE - Adaugă tip nou de eveniment
    @PostMapping("/add")
    public ResponseEntity<?> addTipEveniment(@Valid @RequestBody TipEvenimentAddDto dto) {
        try {
            // Verifică dacă există deja un tip cu același nume pentru acest user
            if (tipEvenimentRepository.existsByUserIdAndNume(dto.getUserId(), dto.getNume())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Există deja un tip de eveniment cu acest nume");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            TipEveniment tipEveniment = new TipEveniment();
            tipEveniment.setNume(dto.getNume());
            tipEveniment.setDuration(dto.getDuration());
            tipEveniment.setUserId(dto.getUserId());

            TipEveniment saved = tipEvenimentRepository.save(tipEveniment);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL - Toate tipurile pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<TipEveniment>> getAllTipuri(@RequestParam Integer userId) {
        List<TipEveniment> tipuri = tipEvenimentRepository.findByUserId(userId);
        return ResponseEntity.ok(tipuri);
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTipById(@PathVariable Long id, @RequestParam Integer userId) {
        return tipEvenimentRepository.findByUserIdAndId(userId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTip(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody TipEvenimentEditDto dto) {

        return tipEvenimentRepository.findByUserIdAndId(userId, id)
                .map(existingTip -> {
                    // Verifică dacă noul nume nu e deja folosit (dacă a fost schimbat)
                    if (dto.getNume() != null && !dto.getNume().equals(existingTip.getNume())) {
                        if (tipEvenimentRepository.existsByUserIdAndNume(userId, dto.getNume())) {
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "Există deja un tip de eveniment cu acest nume");
                            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                        }
                        existingTip.setNume(dto.getNume());
                    }

                    if (dto.getDuration() != null) {
                        existingTip.setDuration(dto.getDuration());
                    }

                    TipEveniment updated = tipEvenimentRepository.save(existingTip);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE - Doar dacă nu are evenimente asociate
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTip(@PathVariable Long id, @RequestParam Integer userId) {
        return tipEvenimentRepository.findByUserIdAndId(userId, id)
                .map(tip -> {
                    // Verifică dacă există evenimente pentru acest tip
                    if (evenimentRepository.existsByUserIdAndTipEvenimentId(userId, Math.toIntExact(id))) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Nu poți șterge acest tip pentru că există evenimente înregistrate");
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                    }

                    tipEvenimentRepository.delete(tip);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Tipul de eveniment a fost șters cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. INITIALIZEAZĂ TIPURILE IMPLICITE - ACUM APELĂM SERVICE-UL
    @PostMapping("/initializeaza-implicite")
    public ResponseEntity<?> initializeazaTipuriImplicite(@RequestParam Integer userId) {
        try {
            List<TipEveniment> tipuri = initializareService.initializeazaTipuriImplicite(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tipurile implicite au fost create cu succes");
            response.put("count", tipuri.size());
            response.put("tipuri", tipuri);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la inițializare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 7. RESETEAZĂ TIPURILE IMPLICITE
    @PostMapping("/reseteaza-implicite")
    public ResponseEntity<?> reseteazaTipuriImplicite(@RequestParam Integer userId) {
        try {
            List<TipEveniment> tipuri = initializareService.reseteazaTipuriImplicite(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tipurile implicite au fost resetate cu succes");
            response.put("count", tipuri.size());
            response.put("tipuri", tipuri);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la resetare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}