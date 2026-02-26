package com.manager.farm.pages.magaziepage;

import com.manager.farm.pages.magaziepage.tipmagazie.querryDto.TipMagazieRepository;
import com.manager.farm.pages.magaziepage.commandDto.MagazieMiscareAddDto;
import com.manager.farm.pages.magaziepage.commandDto.MagazieMiscareDto;
import com.manager.farm.pages.magaziepage.commandDto.MagazieMiscareEditDto;
import com.manager.farm.pages.magaziepage.querryDto.MagazieMiscareRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;



@RestController
@RequestMapping("/api/magazie-miscari")
@CrossOrigin(origins = "*")


public class MagazieMiscareController {

    private final MagazieMiscareRepository miscareRepository;
    private final TipMagazieRepository tipMagazieRepository;
    private final MagazieMiscareService magazieMiscareService; // 🔹 ADAUGĂ SERVICE-UL

    // 🔹 MODIFICĂ CONSTRUCTORUL să includă și service-ul
    public MagazieMiscareController(
            MagazieMiscareRepository miscareRepository,
            TipMagazieRepository tipMagazieRepository,
            MagazieMiscareService magazieMiscareService) { // 🔹 ADAUGĂ PARAMETRUL
        this.miscareRepository = miscareRepository;
        this.tipMagazieRepository = tipMagazieRepository;
        this.magazieMiscareService = magazieMiscareService; // 🔹 INITIALIZEAZĂ
    }

    // 1. CREATE - Adaugă mișcare nouă
    @PostMapping("/add")
    public ResponseEntity<?> addMiscare(@Valid @RequestBody MagazieMiscareAddDto dto) {
        try {
            // Verifică dacă tipul magaziei există
            if (tipMagazieRepository.findByUserIdAndId(dto.getUserId(), dto.getTipMagazieId()).isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Tipul de magazie nu există");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Convertește AddDto în DTO-ul pentru service
            MagazieMiscareDto serviceDto = new MagazieMiscareDto();
            serviceDto.setTipMagazieId(dto.getTipMagazieId());
            serviceDto.setUserId(dto.getUserId());
            serviceDto.setFurnizor(dto.getFurnizor());
            serviceDto.setDay(dto.getDay());
            serviceDto.setMonth(dto.getMonth());
            serviceDto.setYear(dto.getYear());
            serviceDto.setIntrari(dto.getIntrari());
            serviceDto.setIesiri(dto.getIesiri());

            // Folosește service-ul pentru a adăuga mișcarea
            MagazieMiscare saved = magazieMiscareService.adaugaMiscare(serviceDto);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. GET ALL pentru un tip de magazie
    @GetMapping("/tip/{tipMagazieId}")
    public ResponseEntity<List<MagazieMiscare>> getAllMiscari(
            @PathVariable Long tipMagazieId,
            @RequestParam Integer userId) {

        List<MagazieMiscare> miscari = miscareRepository
                .findByUserIdAndTipMagazieIdOrderByYearDescMonthDescDayDesc(userId, tipMagazieId);
        return ResponseEntity.ok(miscari);
    }

    // 3. GET RAPORT pe perioadă
    @GetMapping("/raport")
    public ResponseEntity<?> getRaport(
            @RequestParam Integer userId,
            @RequestParam Long tipMagazieId,
            @RequestParam Integer year,
            @RequestParam(required = false) Integer month) {

        if (!tipMagazieRepository.findByUserIdAndId(userId, tipMagazieId).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        List<MagazieMiscare> miscari;

        if (month != null) {
            miscari = miscareRepository.findByUserIdAndTipMagazieIdAndYearAndMonthOrderByDayAsc(
                    userId, tipMagazieId, year, month);
        } else {
            miscari = miscareRepository.findByUserIdAndTipMagazieIdAndYearOrderByMonthAscDayAsc(
                    userId, tipMagazieId, year);
        }

        if (miscari.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Nu există mișcări pentru perioada selectată");
            return ResponseEntity.ok(response);
        }

        // Calculează totaluri
        double totalIntrari = miscari.stream().mapToDouble(MagazieMiscare::getIntrari).sum();
        double totalIesiri = miscari.stream().mapToDouble(MagazieMiscare::getIesiri).sum();
        double stocFinal = miscari.get(miscari.size() - 1).getStocFinal();
        double stocInitial = miscari.get(0).getStocFinal() - miscari.get(0).getIntrari() + miscari.get(0).getIesiri();

        Map<String, Object> raport = new HashMap<>();
        raport.put("tipMagazieId", tipMagazieId);
        raport.put("perioada", month != null ?
                "Luna " + month + "/" + year : "Anul " + year);
        raport.put("miscari", miscari);
        raport.put("numarMiscari", miscari.size());
        raport.put("stocInitial", stocInitial);
        raport.put("totalIntrari", totalIntrari);
        raport.put("totalIesiri", totalIesiri);
        raport.put("stocFinal", stocFinal);

        return ResponseEntity.ok(raport);
    }

    // 4. UPDATE - modifică o mișcare
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMiscare(
            @PathVariable Long id,
            @RequestParam Integer userId,
            @Valid @RequestBody MagazieMiscareEditDto dto) {

        return miscareRepository.findById(id)
                .filter(m -> m.getUserId().equals(userId))
                .map(existingMiscare -> {
                    // Păstrăm tipul original sau îl schimbăm
                    Long tipMagazieId = dto.getTipMagazieId() != null ?
                            dto.getTipMagazieId() : existingMiscare.getTipMagazieId();

                    // Trebuie să recalculăm stocurile pentru toate mișcările ulterioare
                    // Operație complexă - deocamdată doar notificăm că nu suportăm update
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Update nu este suportat pentru a păstra integritatea stocurilor. " +
                            "Șterge mișcarea și adaugă una nouă.");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 5. DELETE - șterge o mișcare
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMiscare(
            @PathVariable Long id,
            @RequestParam Integer userId) {

        return miscareRepository.findById(id)
                .filter(m -> m.getUserId().equals(userId))
                .map(miscare -> {
                    // Verifică dacă nu cumva e ultima mișcare și afectează stocul curent
                    List<MagazieMiscare> miscariUlterioare = miscareRepository
                            .findByUserIdAndTipMagazieIdOrderByYearDescMonthDescDayDesc(
                                    userId, miscare.getTipMagazieId());

                    if (!miscariUlterioare.isEmpty() && miscariUlterioare.get(0).getId().equals(id)) {
                        // E cea mai recentă - putem șterge
                        miscareRepository.delete(miscare);

                        // Actualizăm stocul curent? Rămâne la latitudinea utilizatorului
                        // să adauge o nouă mișcare corectă

                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Mișcarea a fost ștearsă. Verifică stocul curent!");
                        return ResponseEntity.ok(response);
                    } else {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Nu poți șterge o mișcare care nu este ultima. " +
                                "Șterge mai întâi mișcările ulterioare.");
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. GET STOC CURENT
    @GetMapping("/stoc-curent")
    public ResponseEntity<?> getStocCurent(
            @RequestParam Integer userId,
            @RequestParam Long tipMagazieId) {

        return miscareRepository
                .findTopByUserIdAndTipMagazieIdOrderByYearDescMonthDescDayDesc(userId, tipMagazieId)
                .map(m -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("tipMagazieId", tipMagazieId);
                    response.put("stocCurent", m.getStocFinal());
                    response.put("ultimaActualizare",
                            m.getDay() + "/" + m.getMonth() + "/" + m.getYear());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("tipMagazieId", tipMagazieId);
                    response.put("stocCurent", 0);
                    response.put("ultimaActualizare", "Nicio mișcare înregistrată");
                    return ResponseEntity.ok(response);
                });
    }
}