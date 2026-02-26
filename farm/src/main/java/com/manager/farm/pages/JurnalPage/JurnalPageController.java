package com.manager.farm.pages.JurnalPage;

import com.manager.farm.pages.JurnalPage.commandDto.JurnalPageAddDto;
import com.manager.farm.pages.JurnalPage.commandDto.JurnalPageEditDto;
import com.manager.farm.pages.JurnalPage.queryDto.JurnalPageRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jurnal")
//@CrossOrigin(origins = "http://localhost:5173")
@CrossOrigin(origins = "*")
public class JurnalPageController {

    private final JurnalPageRepository jurnalPageRepository;

    public JurnalPageController(JurnalPageRepository jurnalPageRepository) {
        this.jurnalPageRepository = jurnalPageRepository;
    }

    // 1. CREATE - Adaugă o înregistrare nouă
    @PostMapping("/add")
    public ResponseEntity<?> addJurnal(@Valid @RequestBody JurnalPageAddDto jurnalPageAddDto) {
        try {
            // Verificăm dacă există deja o înregistrare pentru această zi și acest user
            boolean exists = jurnalPageRepository.existsByDayAndMonthAndYearAndUserId(
                    jurnalPageAddDto.getDay(),
                    jurnalPageAddDto.getMonth(),
                    jurnalPageAddDto.getYear(),
                    jurnalPageAddDto.getUserId()
            );

            if (exists) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Există deja o înregistrare pentru această dată");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            // Convertim DTO în entitate
            JurnalPage jurnalPage = new JurnalPage();

            jurnalPage.setNrAnimale(jurnalPageAddDto.getNrAnimale() != null ? jurnalPageAddDto.getNrAnimale() : 0);
            jurnalPage.setMulsoare1(jurnalPageAddDto.getMulsoare1() != null ? jurnalPageAddDto.getMulsoare1() : 0);
            jurnalPage.setMulsoare2(jurnalPageAddDto.getMulsoare2() != null ? jurnalPageAddDto.getMulsoare2() : 0);
            jurnalPage.setValoarePredata(jurnalPageAddDto.getValoarePredata() != null ? jurnalPageAddDto.getValoarePredata() : 0);
            jurnalPage.setDestinatar(jurnalPageAddDto.getDestinatar());
            jurnalPage.setLapteVitei(jurnalPageAddDto.getLapteVitei() != null ? jurnalPageAddDto.getLapteVitei() : 0);

            // Câmpuri opționale noi
            jurnalPage.setVanzareExterna(jurnalPageAddDto.getVanzareExterna() != null ? jurnalPageAddDto.getVanzareExterna() : 0);
            jurnalPage.setVanzareExternaDestinatar(jurnalPageAddDto.getVanzareExternaDestinatar() != null ? jurnalPageAddDto.getVanzareExternaDestinatar() : "");

            jurnalPage.setDay(jurnalPageAddDto.getDay());
            jurnalPage.setMonth(jurnalPageAddDto.getMonth());
            jurnalPage.setYear(jurnalPageAddDto.getYear());
            jurnalPage.setUserId(jurnalPageAddDto.getUserId());

            // Salvăm în baza de date
            JurnalPage savedJurnal = jurnalPageRepository.save(jurnalPage);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedJurnal);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Eroare la salvare: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // 2. READ ALL - Obține toate înregistrările pentru un user
    @GetMapping("/all")
    public ResponseEntity<List<JurnalPage>> getAllJurnal(
            @RequestParam Integer userId) {

        List<JurnalPage> jurnalList = jurnalPageRepository.findByUserId(userId);
        return ResponseEntity.ok(jurnalList);
    }

    // 3. READ BY ID - Obține o înregistrare după ID (verifică userId)
    @GetMapping("/{id}")
    public ResponseEntity<?> getJurnalById(
            @PathVariable Long id,
            @RequestParam Integer userId) {

        return jurnalPageRepository.findById(id)
                .filter(jurnal -> jurnal.getUserId() == userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. READ BY DATE - Obține după an, lună, zi (CU FILTRU PE USER)
    @GetMapping("/cauta")
    public ResponseEntity<List<JurnalPage>> getJurnalByDate(
            @RequestParam Integer userId,
            @RequestParam Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day) {

        List<JurnalPage> jurnalList;

        if (day != null && month != null) {
            jurnalList = jurnalPageRepository.findByUserIdAndDayAndMonthAndYear(userId, day, month, year);
        } else if (month != null) {
            jurnalList = jurnalPageRepository.findByUserIdAndMonthAndYear(userId, month, year);
        } else {
            jurnalList = jurnalPageRepository.findByUserIdAndYear(userId, year);
        }

        return ResponseEntity.ok(jurnalList);
    }

    // 5. UPDATE - Actualizează o înregistrare existentă
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateJurnal(
            @PathVariable Long id,
            @Valid @RequestBody JurnalPageEditDto jurnalPageEditDto) {

        return jurnalPageRepository.findById(id)
                .filter(jurnal -> jurnal.getUserId() == jurnalPageEditDto.getUserId())
                .map(existingJurnal -> {
                    // Actualizăm câmpurile obligatorii
                    existingJurnal.setNrAnimale(jurnalPageEditDto.getNrAnimale() != null ? jurnalPageEditDto.getNrAnimale() : 0);
                    existingJurnal.setMulsoare1(jurnalPageEditDto.getMulsoare1() != null ? jurnalPageEditDto.getMulsoare1() : 0);
                    existingJurnal.setMulsoare2(jurnalPageEditDto.getMulsoare2() != null ? jurnalPageEditDto.getMulsoare2() : 0);
                    existingJurnal.setValoarePredata(jurnalPageEditDto.getValoarePredata() != null ? jurnalPageEditDto.getValoarePredata() : 0);
                    existingJurnal.setDestinatar(jurnalPageEditDto.getDestinatar());
                    existingJurnal.setLapteVitei(jurnalPageEditDto.getLapteVitei() != null ? jurnalPageEditDto.getLapteVitei() : 0);

                    // Câmpuri opționale noi
                    if (jurnalPageEditDto.getVanzareExterna() != null) {
                        existingJurnal.setVanzareExterna(jurnalPageEditDto.getVanzareExterna());
                    }
                    if (jurnalPageEditDto.getVanzareExternaDestinatar() != null) {
                        existingJurnal.setVanzareExternaDestinatar(jurnalPageEditDto.getVanzareExternaDestinatar());
                    }

                    existingJurnal.setDay(jurnalPageEditDto.getDay());
                    existingJurnal.setMonth(jurnalPageEditDto.getMonth());
                    existingJurnal.setYear(jurnalPageEditDto.getYear());
                    // userId nu se schimbă

                    // Verificăm dacă noua dată nu este deja ocupată (dacă s-a schimbat data)
                    if (jurnalPageEditDto.getDay() != existingJurnal.getDay() ||
                            jurnalPageEditDto.getMonth() != existingJurnal.getMonth() ||
                            jurnalPageEditDto.getYear() != existingJurnal.getYear()) {

                        boolean exists = jurnalPageRepository.existsByDayAndMonthAndYearAndUserId(
                                jurnalPageEditDto.getDay(),
                                jurnalPageEditDto.getMonth(),
                                jurnalPageEditDto.getYear(),
                                jurnalPageEditDto.getUserId()
                        );

                        if (exists) {
                            Map<String, String> error = new HashMap<>();
                            error.put("error", "Există deja o înregistrare pentru această dată");
                            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
                        }
                    }

                    // Salvăm și returnăm entitatea actualizată
                    JurnalPage updatedJurnal = jurnalPageRepository.save(existingJurnal);
                    return ResponseEntity.ok(updatedJurnal);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 6. DELETE - Șterge o înregistrare (doar dacă aparține userului)
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteJurnal(
            @PathVariable Long id,
            @RequestParam Integer userId) {

        return jurnalPageRepository.findById(id)
                .filter(jurnal -> jurnal.getUserId() == userId)
                .map(jurnal -> {
                    jurnalPageRepository.deleteById(id);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Înregistrarea a fost ștearsă cu succes");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 7. GET STATISTICS - Obține statistici pentru o perioadă (pentru un user)
    @GetMapping("/statistici")
    public ResponseEntity<?> getStatistics(
            @RequestParam Integer userId,
            @RequestParam Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer day) {

        List<JurnalPage> jurnalList;

        if (day != null && month != null) {
            jurnalList = jurnalPageRepository.findByUserIdAndDayAndMonthAndYear(userId, day, month, year);
        } else if (month != null) {
            jurnalList = jurnalPageRepository.findByUserIdAndMonthAndYear(userId, month, year);
        } else {
            jurnalList = jurnalPageRepository.findByUserIdAndYear(userId, year);
        }

        if (jurnalList.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Nu există date pentru perioada selectată");
            return ResponseEntity.ok(response);
        }

        // Calculează statistici
        long totalNrAnimale = jurnalList.stream().mapToLong(JurnalPage::getNrAnimale).sum();
        long totalMulsoare1 = jurnalList.stream().mapToLong(JurnalPage::getMulsoare1).sum();
        long totalMulsoare2 = jurnalList.stream().mapToLong(JurnalPage::getMulsoare2).sum();
        long totalValoarePredata = jurnalList.stream().mapToLong(JurnalPage::getValoarePredata).sum();
        long totalLapteVitei = jurnalList.stream().mapToLong(JurnalPage::getLapteVitei).sum();
        long totalVanzareExterna = jurnalList.stream().mapToLong(JurnalPage::getVanzareExterna).sum();
        long totalLapte = totalMulsoare1 + totalMulsoare2;

        double medieLaptePerAnimal = totalNrAnimale > 0 ?
                (double) totalLapte / totalNrAnimale : 0;

        // Construim descrierea perioadei
        String perioada;
        if (day != null && month != null) {
            perioada = "Ziua " + day + "/" + month + "/" + year;
        } else if (month != null) {
            perioada = "Luna " + month + "/" + year;
        } else {
            perioada = "Anul " + year;
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("userId", userId);
        statistics.put("perioada", perioada);
        statistics.put("numarInregistrari", jurnalList.size());
        statistics.put("totalAnimale", totalNrAnimale);
        statistics.put("totalMulsoare1", totalMulsoare1);
        statistics.put("totalMulsoare2", totalMulsoare2);
        statistics.put("totalLapte", totalLapte);
        statistics.put("totalValoarePredata", totalValoarePredata);
        statistics.put("totalLapteVitei", totalLapteVitei);
        statistics.put("totalVanzareExterna", totalVanzareExterna);
        statistics.put("medieLaptePerAnimal", String.format("%.2f", medieLaptePerAnimal));

        return ResponseEntity.ok(statistics);
    }
}