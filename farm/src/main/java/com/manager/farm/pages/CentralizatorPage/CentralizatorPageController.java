package com.manager.farm.pages.CentralizatorPage;

import com.manager.farm.pages.CentralizatorPage.commandDto.CentralizatorPageAddDto;
import com.manager.farm.pages.CentralizatorPage.commandDto.CentralizatorPageEditDto;
import com.manager.farm.pages.CentralizatorPage.queryDto.CentralizatorPageRepository;
import com.manager.farm.pages.magaziepage.tipmagazie.querryDto.TipMagazieRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/centralizator")
@CrossOrigin(origins = "http://localhost:5173")
public class CentralizatorPageController {

    private final CentralizatorPageRepository centralizatorRepository;
    private final TipMagazieRepository tipMagazieRepository;

    public CentralizatorPageController(
            CentralizatorPageRepository centralizatorRepository,
            TipMagazieRepository tipMagazieRepository) {
        this.centralizatorRepository = centralizatorRepository;
        this.tipMagazieRepository = tipMagazieRepository;
    }

    // 1. CREATE - Adaugă o înregistrare nouă
    @PostMapping("/add")
    public ResponseEntity<?> addCentralizator(@Valid @RequestBody CentralizatorPageAddDto dto) {
        try {
            // Verificăm dacă tipul de furaj există
            var tipOpt = tipMagazieRepository.findByUserIdAndId(dto.getUserId(), dto.getTipMagazieId());
            if (tipOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Tipul de furaj nu există");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Verificăm dacă există deja o înregistrare pentru această lună și acest tip
            boolean exists = centralizatorRepository.existsByUserIdAndTipMagazieIdAndMonthAndYear(
                    dto.getUserId(),
                    dto.getTipMagazieId(),
                    dto.getMonth(),
                    dto.getYear()
            );

            if (exists) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Există deja o înregistrare pentru acest tip în luna selectată");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            // Convertim DTO în entitate
            CentralizatorPage centralizator = new CentralizatorPage();

            centralizator.setTipMagazieId(dto.getTipMagazieId());
            centralizator.setStocInitial(dto.getStocInitial() != null ? dto.getStocInitial() : 0);
            centralizator.setIntrari(dto.getIntrari() != null ? dto.getIntrari() : 0);

            centralizator.setVaciLapte(dto.getVaciLapte() != null ? dto.getVaciLapte() : 0);
            centralizator.setVaciGestante(dto.getVaciGestante() != null ? dto.getVaciGestante() : 0);
            centralizator.setJuniciGestante(dto.getJuniciGestante() != null ? dto.getJuniciGestante() : 0);
            centralizator.setAlteVaci(dto.getAlteVaci() != null ? dto.getAlteVaci() : 0);
            centralizator.setViteleMontate(dto.getViteleMontate() != null ? dto.getViteleMontate() : 0);
            centralizator.setJunici(dto.getJunici() != null ? dto.getJunici() : 0);
            centralizator.setVitele_6_12Luni(dto.getVitele6_12Luni() != null ? dto.getVitele6_12Luni() : 0);
            centralizator.setVitele_3_6Luni(dto.getVitele3_6Luni() != null ? dto.getVitele3_6Luni() : 0);
            centralizator.setVitele_0_3Luni(dto.getVitele0_3Luni() != null ? dto.getVitele0_3Luni() : 0);
            centralizator.setTaurasi(dto.getTaurasi() != null ? dto.getTaurasi() : 0);

            centralizator.setObservatii(dto.getObservatii());
            centralizator.setUserId(dto.getUserId());
            centralizator.setMonth(dto.getMonth());
            centralizator.setYear(dto.getYear());

            // Salvăm în baza de date
            CentralizatorPage saved = centralizatorRepository.save(centralizator);

            return ResponseEntity.status(HttpStatus.CREATED).body(enrichWithTipDetails(saved));

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL PENTRU O LUNĂ - Obține toate înregistrările pentru o lună
    @GetMapping("/luna")
    public ResponseEntity<?> getByMonth(
            @RequestParam Integer userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {

        List<CentralizatorPage> entries = centralizatorRepository
                .findByUserIdAndMonthAndYearOrderByTipMagazieIdAsc(userId, month, year);

        // Îmbogățim fiecare intrare cu câmpurile calculate și detaliile tipului
        List<Map<String, Object>> enrichedList = entries.stream()
                .map(this::enrichWithAllFields)
                .collect(Collectors.toList());

        return ResponseEntity.ok(enrichedList);
    }

    // 3. INITIALIZEAZĂ LUNA - Creează intrări pentru toate tipurile de furaje
    @PostMapping("/initializeaza-luna")
    public ResponseEntity<?> initializeMonth(
            @RequestParam Integer userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {

        // Obținem toate tipurile de furaje pentru user
        var tipuri = tipMagazieRepository.findByUserId(userId);

        List<CentralizatorPage> createdEntries = tipuri.stream()
                .map(tip -> {
                    // Verificăm dacă există deja o intrare
                    var existing = centralizatorRepository
                            .findByUserIdAndTipMagazieIdAndMonthAndYear(userId, tip.getId(), month, year);

                    if (existing.isPresent()) {
                        return existing.get();
                    }

                    // Căutăm stocul din luna precedentă
                    Integer stocInitial = findPreviousMonthStocFinal(userId, tip.getId(), month, year);

                    // Creăm o intrare nouă
                    CentralizatorPage newEntry = new CentralizatorPage();
                    newEntry.setUserId(userId);
                    newEntry.setTipMagazieId(tip.getId());
                    newEntry.setMonth(month);
                    newEntry.setYear(year);
                    newEntry.setStocInitial(stocInitial);
                    newEntry.setIntrari(0);

                    newEntry.setVaciLapte(0);
                    newEntry.setVaciGestante(0);
                    newEntry.setJuniciGestante(0);
                    newEntry.setAlteVaci(0);
                    newEntry.setViteleMontate(0);
                    newEntry.setJunici(0);
                    newEntry.setVitele_6_12Luni(0);
                    newEntry.setVitele_3_6Luni(0);
                    newEntry.setVitele_0_3Luni(0);
                    newEntry.setTaurasi(0);

                    return centralizatorRepository.save(newEntry);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(createdEntries.stream()
                .map(this::enrichWithTipDetails)
                .collect(Collectors.toList()));
    }

    // 4. UPDATE - Actualizează o înregistrare existentă
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateCentralizator(
            @PathVariable Long id,
            @Valid @RequestBody CentralizatorPageEditDto dto) {

        return centralizatorRepository.findById(id)
                .filter(centralizator -> centralizator.getUserId().equals(dto.getUserId()))
                .map(existing -> {

                    if (dto.getStocInitial() != null) existing.setStocInitial(dto.getStocInitial());
                    if (dto.getIntrari() != null) existing.setIntrari(dto.getIntrari());

                    if (dto.getVaciLapte() != null) existing.setVaciLapte(dto.getVaciLapte());
                    if (dto.getVaciGestante() != null) existing.setVaciGestante(dto.getVaciGestante());
                    if (dto.getJuniciGestante() != null) existing.setJuniciGestante(dto.getJuniciGestante());
                    if (dto.getAlteVaci() != null) existing.setAlteVaci(dto.getAlteVaci());
                    if (dto.getViteleMontate() != null) existing.setViteleMontate(dto.getViteleMontate());
                    if (dto.getJunici() != null) existing.setJunici(dto.getJunici());
                    if (dto.getVitele6_12Luni() != null) existing.setVitele_6_12Luni(dto.getVitele6_12Luni());
                    if (dto.getVitele3_6Luni() != null) existing.setVitele_3_6Luni(dto.getVitele3_6Luni());
                    if (dto.getVitele0_3Luni() != null) existing.setVitele_0_3Luni(dto.getVitele0_3Luni());
                    if (dto.getTaurasi() != null) existing.setTaurasi(dto.getTaurasi());

                    if (dto.getObservatii() != null) existing.setObservatii(dto.getObservatii());

                    CentralizatorPage updated = centralizatorRepository.save(existing);
                    return ResponseEntity.ok(enrichWithAllFields(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE - Șterge o înregistrare
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteCentralizator(
            @PathVariable Long id,
            @RequestParam Integer userId) {

        return centralizatorRepository.findById(id)
                .filter(centralizator -> centralizator.getUserId().equals(userId))
                .map(centralizator -> {
                    centralizatorRepository.deleteById(id);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Înregistrarea a fost ștearsă cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. GET PREVIOUS MONTH STOC - Obține stocul final din luna precedentă pentru un tip
    @GetMapping("/stoc-precedent")
    public ResponseEntity<?> getPreviousMonthStoc(
            @RequestParam Integer userId,
            @RequestParam Long tipMagazieId,
            @RequestParam Integer month,
            @RequestParam Integer year) {

        Integer stocPrecedent = findPreviousMonthStocFinal(userId, tipMagazieId, month, year);

        Map<String, Object> response = new HashMap<>();
        response.put("stocPrecedent", stocPrecedent);

        if (stocPrecedent == 0) {
            response.put("message", "Nu există înregistrare pentru luna precedentă");
        }

        return ResponseEntity.ok(response);
    }

    // 7. GET STATISTICI - Obține statistici pentru o lună
    @GetMapping("/statistici")
    public ResponseEntity<?> getStatistics(
            @RequestParam Integer userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {

        List<CentralizatorPage> entries = centralizatorRepository
                .findByUserIdAndMonthAndYear(userId, month, year);

        if (entries.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Nu există date pentru luna selectată");
            return ResponseEntity.ok(response);
        }

        // Statistici generale
        int totalStocInitial = entries.stream().mapToInt(CentralizatorPage::getStocInitial).sum();
        int totalIntrari = entries.stream().mapToInt(CentralizatorPage::getIntrari).sum();
        int totalConsum = entries.stream().mapToInt(this::calculateTotalConsum).sum();
        int totalStocFinal = entries.stream().mapToInt(this::calculateStocFinal).sum();

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalInregistrari", entries.size());
        statistics.put("totalStocInitial", totalStocInitial);
        statistics.put("totalIntrari", totalIntrari);
        statistics.put("totalConsum", totalConsum);
        statistics.put("totalStocFinal", totalStocFinal);

        return ResponseEntity.ok(statistics);
    }

    // 8. GET BY ID - Obține o înregistrare după ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, @RequestParam Integer userId) {
        return centralizatorRepository.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .map(this::enrichWithAllFields)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== METODE PRIVATE DE UTILITATE ====================

    private int calculateTotalConsum(CentralizatorPage entry) {
        return entry.getVaciLapte() +
                entry.getVaciGestante() +
                entry.getJuniciGestante() +
                entry.getAlteVaci() +
                entry.getViteleMontate() +
                entry.getJunici() +
                entry.getVitele_6_12Luni() +
                entry.getVitele_3_6Luni() +
                entry.getVitele_0_3Luni() +
                entry.getTaurasi();
    }

    private int calculateStocFinal(CentralizatorPage entry) {
        return entry.getStocInitial() + entry.getIntrari() - calculateTotalConsum(entry);
    }

    private Integer findPreviousMonthStocFinal(Integer userId, Long tipMagazieId, Integer currentMonth, Integer currentYear) {
        // Calculează luna precedentă
        int previousMonth = currentMonth - 1;
        int previousYear = currentYear;

        if (previousMonth == 0) {
            previousMonth = 12;
            previousYear = currentYear - 1;
        }

        // Caută în luna precedentă
        var previousEntry = centralizatorRepository
                .findByUserIdAndTipMagazieIdAndMonthAndYear(userId, tipMagazieId, previousMonth, previousYear);

        if (previousEntry.isPresent()) {
            return calculateStocFinal(previousEntry.get());
        }

        // Dacă nu găsește, caută cea mai recentă înregistrare înainte de luna curentă
        var olderEntry = centralizatorRepository
                .findFirstByUserIdAndTipMagazieIdAndYearLessThanOrderByYearDescMonthDesc(
                        userId, tipMagazieId, currentYear);

        if (olderEntry.isPresent()) {
            return calculateStocFinal(olderEntry.get());
        }

        // Încearcă în același an dar lună mai mică
        if (currentMonth > 1) {
            var sameYearEarlier = centralizatorRepository
                    .findFirstByUserIdAndTipMagazieIdAndYearAndMonthLessThanOrderByMonthDesc(
                            userId, tipMagazieId, currentYear, currentMonth);
            if (sameYearEarlier.isPresent()) {
                return calculateStocFinal(sameYearEarlier.get());
            }
        }

        return 0;
    }

    private Map<String, Object> enrichWithTipDetails(CentralizatorPage entry) {
        Map<String, Object> enriched = new HashMap<>();
        enriched.put("id", entry.getId());
        enriched.put("tipMagazieId", entry.getTipMagazieId());
        enriched.put("stocInitial", entry.getStocInitial());
        enriched.put("intrari", entry.getIntrari());

        enriched.put("vaciLapte", entry.getVaciLapte());
        enriched.put("vaciGestante", entry.getVaciGestante());
        enriched.put("juniciGestante", entry.getJuniciGestante());
        enriched.put("alteVaci", entry.getAlteVaci());
        enriched.put("viteleMontate", entry.getViteleMontate());
        enriched.put("junici", entry.getJunici());
        enriched.put("vitele6_12Luni", entry.getVitele_6_12Luni());
        enriched.put("vitele3_6Luni", entry.getVitele_3_6Luni());
        enriched.put("vitele0_3Luni", entry.getVitele_0_3Luni());
        enriched.put("taurasi", entry.getTaurasi());

        enriched.put("observatii", entry.getObservatii());
        enriched.put("userId", entry.getUserId());
        enriched.put("month", entry.getMonth());
        enriched.put("year", entry.getYear());

        // Adăugăm detalii despre tip
        tipMagazieRepository.findByUserIdAndId(entry.getUserId(), entry.getTipMagazieId())
                .ifPresent(tip -> {
                    enriched.put("cod", tip.getCod());
                    enriched.put("denumire", tip.getDenumire());
                    enriched.put("unitateMasura", tip.getUnitateMasura());
                });

        return enriched;
    }

    private Map<String, Object> enrichWithAllFields(CentralizatorPage entry) {
        Map<String, Object> enriched = enrichWithTipDetails(entry);
        enriched.put("totalConsum", calculateTotalConsum(entry));
        enriched.put("stocFinal", calculateStocFinal(entry));
        return enriched;
    }
}