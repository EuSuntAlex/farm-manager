package com.manager.farm.pages.evenimentPage;

import com.manager.farm.pages.bovinePage.queryDto.BovinaRepository;
import com.manager.farm.pages.evenimentPage.commandDto.EvenimentAddDto;
import com.manager.farm.pages.evenimentPage.commandDto.EvenimentEditDto;
import com.manager.farm.pages.evenimentPage.commandDto.EvenimentResponseDto;
import com.manager.farm.pages.evenimentPage.queryDto.EvenimentRepository;
import com.manager.farm.pages.evenimentPage.tipEveniment.queryDto.TipEvenimentRepository;
import jakarta.validation.Valid;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
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
    private final ApplicationEventPublisher eventPublisher;
    private final BovinaRepository bovinaRepository;

    public EvenimentController(
            EvenimentRepository evenimentRepository,
            TipEvenimentRepository tipEvenimentRepository, ApplicationEventPublisher eventPublisher, BovinaRepository bovinaRepository) {
        this.evenimentRepository = evenimentRepository;
        this.tipEvenimentRepository = tipEvenimentRepository;
        this.eventPublisher = eventPublisher;
        this.bovinaRepository = bovinaRepository;
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

            // Setează bovinaId dacă există
            if (dto.getBovinaId() != null) {
                eveniment.setBovinaId(Math.toIntExact(dto.getBovinaId()));
            }

            // Calculează automat data de sfârșit pe baza duratei tipului
            eveniment.calculeazaDataSfarsit(tipEveniment.getDuration());

            Eveniment saved = evenimentRepository.save(eveniment);

            // 🔥 LOGICĂ SPECIALĂ: Verifică dacă e eveniment de tip "Fătare" și incrementează numărul de fătări
            if (dto.getBovinaId() != null && esteEvenimentFatare(tipEveniment.getNume())) {
                incrementNrFatari(dto.getBovinaId(), dto.getUserId());
            }

            // Returnează răspunsul îmbogățit cu date calculate
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponseDto(saved, tipEveniment.getNume(), tipEveniment.getDuration()));

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Verifică dacă numele evenimentului indică o fătare
     */
    private boolean esteEvenimentFatare(String numeEveniment) {
        if (numeEveniment == null) return false;

        // Lista de cuvinte cheie pentru evenimentele care indică o fătare
        String[] keywords = {"fătare", "fatare", "naștere", "nastere", "fătat", "fatat", "parturiție", "parturitie"};

        String numeLower = numeEveniment.toLowerCase();
        return Arrays.stream(keywords)
                .anyMatch(keyword -> numeLower.contains(keyword));
    }

    /**
     * Incrementează numărul de fătări pentru o bovină
     */
    private void incrementNrFatari(Long bovinaId, Integer userId) {
        bovinaRepository.findByUserIdAndId(userId, bovinaId).ifPresent(bovina -> {
            int nrFatariCurent = bovina.getNrFatari() != null ? bovina.getNrFatari() : 0;
            bovina.setNrFatari(nrFatariCurent + 1);
            bovinaRepository.save(bovina);

            // Poți adăuga un log pentru debugging
            System.out.println("Incrementat nrFatari pentru bovina " + bovinaId +
                    " de la " + nrFatariCurent + " la " + (nrFatariCurent + 1));
        });
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
    // 9. GET EVENIMENTE BY BOVINA ID
    @GetMapping("/by-bovine/{bovinaId}")
    public ResponseEntity<?> getEvenimenteByBovina(
            @PathVariable Long bovinaId,
            @RequestParam Integer userId) {
        try {
            // Verifică dacă există evenimente pentru această bovină
            List<Eveniment> evenimente = evenimentRepository.findByUserIdAndBovinaId(userId, bovinaId);

            if (evenimente.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(new ErrorResponse("Nu există evenimente pentru această bovină",
                                HttpStatus.NO_CONTENT.value()));
            }

            List<EvenimentResponseDto> response = evenimente.stream()
                    .map(this::convertToResponseDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la încărcarea evenimentelor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}