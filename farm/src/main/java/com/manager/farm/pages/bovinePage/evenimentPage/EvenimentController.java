package com.manager.farm.pages.bovinePage.evenimentPage;

import com.manager.farm.pages.bovinePage.evenimentPage.commandDto.EvenimentAddDto;
import com.manager.farm.pages.bovinePage.evenimentPage.commandDto.EvenimentEditDto;
import com.manager.farm.pages.bovinePage.evenimentPage.commandDto.EvenimentResponseDto;
import com.manager.farm.pages.bovinePage.evenimentPage.queryDto.EvenimentRepository;
import com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.queryDto.TipEvenimentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/eveniment")
@CrossOrigin(origins = "*")
public class EvenimentController {

    private final EvenimentRepository evenimentRepository;
    private final TipEvenimentRepository tipEvenimentRepository;

    public EvenimentController(
            EvenimentRepository evenimentRepository,
            TipEvenimentRepository tipEvenimentRepository) {
        this.evenimentRepository = evenimentRepository;
        this.tipEvenimentRepository = tipEvenimentRepository;
    }

    // 1. CREATE - Adaugă eveniment nou
    @PostMapping("/add")
    public ResponseEntity<?> addEveniment(@Valid @RequestBody EvenimentAddDto dto) {
        try {
            // Verifică dacă tipul de eveniment există
            var tipEveniment = tipEvenimentRepository
                    .findByUserIdAndId(dto.getUserId(), (long) dto.getTipEvenimentId())
                    .orElse(null);

            if (tipEveniment == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Tipul de eveniment nu există");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            Eveniment eveniment = new Eveniment();
            eveniment.setTipEvenimentId(dto.getTipEvenimentId());
            eveniment.setTitle(dto.getTitle());
            eveniment.setDateStart(dto.getDateStart());
            eveniment.setUserId(dto.getUserId());

            // Calculează automat data de sfârșit pe baza duratei tipului
            eveniment.calculeazaDataSfarsit(tipEveniment.getDuration());

            Eveniment saved = evenimentRepository.save(eveniment);

            // Returnează răspunsul îmbogățit cu date calculate
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponseDto(saved, tipEveniment.getNume(), tipEveniment.getDuration()));

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL - Toate evenimentele pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<EvenimentResponseDto>> getAllEvenimente(@RequestParam Integer userId) {
        List<Eveniment> evenimente = evenimentRepository.findByUserId(userId);

        List<EvenimentResponseDto> response = evenimente.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 3. GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEvenimentById(@PathVariable Long id, @RequestParam Integer userId) {
        return evenimentRepository.findByUserIdAndId(userId, id)
                .map(eveniment -> ResponseEntity.ok(convertToResponseDto(eveniment)))
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. UPDATE
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateEveniment(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody EvenimentEditDto dto) {

        return evenimentRepository.findByUserIdAndId(userId, id)
                .map(existingEveniment -> {
                    try {
                        if (dto.getTipEvenimentId() != null) {
                            // Verifică dacă noul tip există
                            var tipEveniment = tipEvenimentRepository
                                    .findByUserIdAndId(userId, (long) dto.getTipEvenimentId())
                                    .orElse(null);

                            if (tipEveniment == null) {
                                Map<String, String> error = new HashMap<>();
                                error.put("error", "Tipul de eveniment nu există");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
                            }

                            existingEveniment.setTipEvenimentId(dto.getTipEvenimentId());

                            // Recalculează data de sfârșit dacă s-a schimbat tipul sau data de start
                            if (dto.getDateStart() != null) {
                                existingEveniment.setDateStart(dto.getDateStart());
                            }
                            existingEveniment.calculeazaDataSfarsit(tipEveniment.getDuration());
                        }

                        if (dto.getTitle() != null) {
                            existingEveniment.setTitle(dto.getTitle());
                        }

                        if (dto.getDateStart() != null) {
                            existingEveniment.setDateStart(dto.getDateStart());
                            // Recalculează data de sfârșit dacă s-a schimbat data de start
                            var tipEveniment = tipEvenimentRepository
                                    .findByUserIdAndId(userId, (long) existingEveniment.getTipEvenimentId())
                                    .orElse(null);
                            if (tipEveniment != null) {
                                existingEveniment.calculeazaDataSfarsit(tipEveniment.getDuration());
                            }
                        }

                        Eveniment updated = evenimentRepository.save(existingEveniment);
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
    public ResponseEntity<?> deleteEveniment(@PathVariable Long id, @RequestParam Integer userId) {
        return evenimentRepository.findByUserIdAndId(userId, id)
                .map(eveniment -> {
                    evenimentRepository.delete(eveniment);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Evenimentul a fost șters cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. GET EVENIMENTE VIITOARE
    @GetMapping("/viitoare")
    public ResponseEntity<List<EvenimentResponseDto>> getEvenimenteViitoare(@RequestParam Integer userId) {
        List<Eveniment> evenimente = evenimentRepository
                .findByUserIdAndDateStartAfter(userId, LocalDateTime.now());

        List<EvenimentResponseDto> response = evenimente.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 7. GET EVENIMENTE IN DESFĂȘURARE
    @GetMapping("/in-desfasurare")
    public ResponseEntity<List<EvenimentResponseDto>> getEvenimenteInDesfasurare(@RequestParam Integer userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Eveniment> evenimente = evenimentRepository
                .findByUserIdAndDateStartLessThanEqualAndDateEndGreaterThanEqual(userId, now, now);

        List<EvenimentResponseDto> response = evenimente.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 8. GET EVENIMENTE DIN ULTIMELE 30 ZILE
    @GetMapping("/ultimele-30-zile")
    public ResponseEntity<List<EvenimentResponseDto>> getEvenimenteUltimele30Zile(@RequestParam Integer userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        List<Eveniment> evenimente = evenimentRepository
                .findByUserIdAndDateStartBetween(userId, thirtyDaysAgo, now);

        List<EvenimentResponseDto> response = evenimente.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Metodă helper pentru conversia la ResponseDto
    private EvenimentResponseDto convertToResponseDto(Eveniment eveniment) {
        return convertToResponseDto(eveniment, null, 0);
    }

    private EvenimentResponseDto convertToResponseDto(Eveniment eveniment, String tipNume, int durata) {
        EvenimentResponseDto dto = new EvenimentResponseDto();
        dto.setId(eveniment.getId());
        dto.setTipEvenimentId(eveniment.getTipEvenimentId());
        dto.setTitle(eveniment.getTitle());
        dto.setDateStart(eveniment.getDateStart());
        dto.setDateEnd(eveniment.getDateEnd());
        dto.setUserId(eveniment.getUserId());

        // Încearcă să obțină numele tipului și durata din repository dacă nu sunt furnizate
        if (tipNume == null) {
            var tipEveniment = tipEvenimentRepository
                    .findByUserIdAndId(eveniment.getUserId(), (long) eveniment.getTipEvenimentId())
                    .orElse(null);
            if (tipEveniment != null) {
                dto.setTipEvenimentNume(tipEveniment.getNume());
                dto.setDurata(tipEveniment.getDuration());
            }
        } else {
            dto.setTipEvenimentNume(tipNume);
            dto.setDurata(durata);
        }

        // Calculează statusul și zilele rămase
        LocalDateTime now = LocalDateTime.now();
        if (eveniment.getDateStart() != null && eveniment.getDateEnd() != null) {
            if (now.isBefore(eveniment.getDateStart())) {
                dto.setStatus("VIITOR");
                dto.setZileRamase(0);
            } else if (now.isAfter(eveniment.getDateEnd())) {
                dto.setStatus("INCHIS");
                dto.setZileRamase(0);
            } else {
                dto.setStatus("IN_DESFASURARE");
                // Calculează zilele rămase până la sfârșit
                long zileRamase = java.time.Duration.between(now, eveniment.getDateEnd()).toDays();
                dto.setZileRamase(zileRamase > 0 ? (int) zileRamase : 0);
            }
        }

        return dto;
    }
}