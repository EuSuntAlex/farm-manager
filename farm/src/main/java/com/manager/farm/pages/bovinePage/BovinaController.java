package com.manager.farm.pages.bovinePage;

import com.manager.farm.pages.bovinePage.commandDto.BovinaAddDto;
import com.manager.farm.pages.bovinePage.commandDto.BovinaEditDto;
import com.manager.farm.pages.bovinePage.queryDto.BovinaRepository;
import com.manager.farm.pages.bovinePage.queryDto.BovinaResponseDto;
import com.manager.farm.pages.bovinePage.tipBovina.queryDto.TipBovinaRepository;
import com.manager.farm.pages.retetaPage.queryDto.RetetaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bovine")
@CrossOrigin(origins = "*")
public class BovinaController {

    private final BovinaRepository bovinaRepository;
    private final TipBovinaRepository tipBovinaRepository;
    private final RetetaRepository retetaRepository;

    public BovinaController(
            BovinaRepository bovinaRepository,
            TipBovinaRepository tipBovinaRepository,
            RetetaRepository retetaRepository) {
        this.bovinaRepository = bovinaRepository;
        this.tipBovinaRepository = tipBovinaRepository;
        this.retetaRepository = retetaRepository;
    }

    // 1. CREATE - Adaugă bovină nouă
    @PostMapping("/add")
    public ResponseEntity<?> addBovina(@Valid @RequestBody BovinaAddDto dto) {
        try {
            // Verifică dacă rasa există
            if (!tipBovinaRepository.existsById(dto.getTipBovinaId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Rasa cu ID " + dto.getTipBovinaId() + " nu există");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verifică dacă rețeta există (dacă a fost specificată)
            if (dto.getRetetaId() != null && !retetaRepository.existsById(dto.getRetetaId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Rețeta cu ID " + dto.getRetetaId() + " nu există");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Bovina bovina = new Bovina();
            bovina.setUserId(dto.getUserId());
            bovina.setDateBirth(dto.getDateBirth());
            bovina.setIsMale(dto.getIsMale());
            bovina.setGreutate(dto.getGreutate());  // NOU: setează greutatea
            bovina.setNrFatari(dto.getNrFatari() != null ? dto.getNrFatari() : 0);
            bovina.setProductieLapte(dto.getProductieLapte());
            bovina.setNota(dto.getNota());
            bovina.setLocation(dto.getLocation());
            bovina.setIsObserved(dto.getIsObserved() != null ? dto.getIsObserved() : false);
            bovina.setRetetaId(dto.getRetetaId());
            bovina.setTipBovinaId(dto.getTipBovinaId());

            Bovina saved = bovinaRepository.save(bovina);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponseDto(saved));

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL - Toate bovinele pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<BovinaResponseDto>> getAllBovine(@RequestParam Integer userId) {
        List<Bovina> bovine = bovinaRepository.findByUserId(userId);

        List<BovinaResponseDto> result = bovine.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBovinaById(@PathVariable Long id, @RequestParam Integer userId) {
        return bovinaRepository.findByUserIdAndId(userId, id)
                .map(bovina -> ResponseEntity.ok(convertToResponseDto(bovina)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateBovina(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody BovinaEditDto dto) {

        return bovinaRepository.findByUserIdAndId(userId, id)
                .map(existingBovina -> {
                    try {
                        // Verifică rasa dacă a fost schimbată
                        if (dto.getTipBovinaId() != null && !dto.getTipBovinaId().equals(existingBovina.getTipBovinaId())) {
                            if (!tipBovinaRepository.existsById(dto.getTipBovinaId())) {
                                Map<String, String> error = new HashMap<>();
                                error.put("error", "Rasa cu ID " + dto.getTipBovinaId() + " nu există");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                            }
                            existingBovina.setTipBovinaId(dto.getTipBovinaId());
                        }

                        // Verifică rețeta dacă a fost schimbată
                        if (dto.getRetetaId() != null && !dto.getRetetaId().equals(existingBovina.getRetetaId())) {
                            if (!retetaRepository.existsById(dto.getRetetaId())) {
                                Map<String, String> error = new HashMap<>();
                                error.put("error", "Rețeta cu ID " + dto.getRetetaId() + " nu există");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                            }
                            existingBovina.setRetetaId(dto.getRetetaId());
                        }

                        if (dto.getDateBirth() != null) {
                            existingBovina.setDateBirth(dto.getDateBirth());
                        }
                        if (dto.getIsMale() != null) {
                            existingBovina.setIsMale(dto.getIsMale());
                        }
                        if (dto.getGreutate() != null) {  // NOU: actualizează greutatea
                            existingBovina.setGreutate(dto.getGreutate());
                        }
                        if (dto.getNrFatari() != null) {
                            existingBovina.setNrFatari(dto.getNrFatari());
                        }
                        if (dto.getProductieLapte() != null) {
                            existingBovina.setProductieLapte(dto.getProductieLapte());
                        }
                        if (dto.getNota() != null) {
                            existingBovina.setNota(dto.getNota());
                        }
                        if (dto.getLocation() != null) {
                            existingBovina.setLocation(dto.getLocation());
                        }
                        if (dto.getIsObserved() != null) {
                            existingBovina.setIsObserved(dto.getIsObserved());
                        }

                        Bovina updated = bovinaRepository.save(existingBovina);
                        return ResponseEntity.ok(convertToResponseDto(updated));

                    } catch (Exception e) {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Eroare la actualizare: " + e.getMessage());
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBovina(@PathVariable Long id, @RequestParam Integer userId) {
        return bovinaRepository.findByUserIdAndId(userId, id)
                .map(bovina -> {
                    bovinaRepository.delete(bovina);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Bovina a fost ștearsă cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. GET BY RASA
    @GetMapping("/by-rasa/{tipBovinaId}")
    public ResponseEntity<List<BovinaResponseDto>> getBovineByRasa(
            @PathVariable Long tipBovinaId,
            @RequestParam Integer userId) {
        List<Bovina> bovine = bovinaRepository.findByUserIdAndTipBovinaId(userId, tipBovinaId);

        List<BovinaResponseDto> result = bovine.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 7. GET BY SEX
    @GetMapping("/by-sex")
    public ResponseEntity<List<BovinaResponseDto>> getBovineBySex(
            @RequestParam Boolean isMale,
            @RequestParam Integer userId) {
        List<Bovina> bovine = bovinaRepository.findByUserIdAndIsMale(userId, isMale);

        List<BovinaResponseDto> result = bovine.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // 8. GET BY RETETA
    @GetMapping("/by-reteta/{retetaId}")
    public ResponseEntity<List<BovinaResponseDto>> getBovineByReteta(
            @PathVariable Long retetaId,
            @RequestParam Integer userId) {
        List<Bovina> bovine = bovinaRepository.findByUserIdAndRetetaId(userId, retetaId);

        List<BovinaResponseDto> result = bovine.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Metodă helper pentru conversie
    private BovinaResponseDto convertToResponseDto(Bovina bovina) {
        BovinaResponseDto dto = new BovinaResponseDto();
        dto.setId(bovina.getId());
        dto.setUserId(bovina.getUserId());
        dto.setDateBirth(bovina.getDateBirth());
        dto.setIsMale(bovina.getIsMale());
        dto.setSex(bovina.getIsMale() ? "Mascul" : "Femelă");
        dto.setGreutate(bovina.getGreutate());  // NOU: adaugă greutatea
        dto.setNrFatari(bovina.getNrFatari());
        dto.setProductieLapte(bovina.getProductieLapte());
        dto.setNota(bovina.getNota());
        dto.setLocation(bovina.getLocation());
        dto.setIsObserved(bovina.getIsObserved());

        // Calculează statusul în funcție de vârstă
        if (bovina.getDateBirth() != null) {
            long ageInMonths = java.time.Period.between(bovina.getDateBirth(), java.time.LocalDate.now()).toTotalMonths();
            if (ageInMonths < 12) {
                dto.setStatus("Tânăr");
            } else if (ageInMonths < 60) {
                dto.setStatus("Adult");
            } else {
                dto.setStatus("Bătrân");
            }
        }

        // Adaugă informații despre rasă
        dto.setTipBovinaId(bovina.getTipBovinaId());
        tipBovinaRepository.findById(bovina.getTipBovinaId()).ifPresent(tip -> {
            dto.setTipBovinaNume(tip.getName());
        });

        // Adaugă informații despre rețetă
        dto.setRetetaId(bovina.getRetetaId());
        if (bovina.getRetetaId() != null) {
            retetaRepository.findById(bovina.getRetetaId()).ifPresent(reteta -> {
                dto.setRetetaNume(reteta.getNume());
            });
        }

        return dto;
    }
}