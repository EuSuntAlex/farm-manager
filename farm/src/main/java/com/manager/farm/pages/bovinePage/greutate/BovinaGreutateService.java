package com.manager.farm.pages.bovinePage.greutate;

import com.manager.farm.pages.bovinePage.Bovina;
import com.manager.farm.pages.bovinePage.greutate.commandDto.BovinaGreutateAddDto;
import com.manager.farm.pages.bovinePage.greutate.queryDto.BovinaGreutateIstoricRepository;
import com.manager.farm.pages.bovinePage.greutate.queryDto.BovinaGreutateResponseDto;
import com.manager.farm.pages.bovinePage.queryDto.BovinaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class BovinaGreutateService {

    private final BovinaGreutateIstoricRepository greutateRepository;
    private final BovinaRepository bovinaRepository;

    public BovinaGreutateService(
            BovinaGreutateIstoricRepository greutateRepository,
            BovinaRepository bovinaRepository) {
        this.greutateRepository = greutateRepository;
        this.bovinaRepository = bovinaRepository;
    }

    @Transactional
    public BovinaGreutateIstoric addMasuratoare(BovinaGreutateAddDto dto) {
        // Verifică dacă bovina există și aparține userului
        Bovina bovina = bovinaRepository.findByUserIdAndId(dto.getUserId(), dto.getBovinaId())
                .orElseThrow(() -> new IllegalArgumentException("Bovina nu a fost găsită"));

        // Adaugă măsurătoarea
        BovinaGreutateIstoric masuratoare = new BovinaGreutateIstoric();
        masuratoare.setBovinaId(dto.getBovinaId());
        masuratoare.setGreutate(dto.getGreutate());
        masuratoare.setDataMasuratoare(dto.getDataMasuratoare());
        masuratoare.setNota(dto.getNota());
        masuratoare.setCreatedAt(LocalDateTime.now());

        BovinaGreutateIstoric saved = greutateRepository.save(masuratoare);

        // Opțional: Actualizează și greutatea curentă în tabela bovina
        // (dacă vrei să păstrezi și câmpul greutate ca "ultima greutate cunoscută")
        if (bovina.getGreutate() == null ||
                !bovina.getGreutate().equals(dto.getGreutate())) {
            bovina.setGreutate(dto.getGreutate());
            bovinaRepository.save(bovina);
        }

        return saved;
    }

    public List<BovinaGreutateResponseDto> getIstoricGreutate(Long bovinaId, Integer userId) {
        // Verifică dacă bovina există
        if (!bovinaRepository.findByUserIdAndId(userId, bovinaId).isPresent()) {
            throw new IllegalArgumentException("Bovina nu a fost găsită");
        }

        List<BovinaGreutateIstoric> masuratori =
                greutateRepository.findByBovinaIdOrderByDataMasuratoareAsc(bovinaId);

        List<BovinaGreutateResponseDto> result = new ArrayList<>();
        Bovina bovina = bovinaRepository.findById(bovinaId).orElse(null);

        for (int i = 0; i < masuratori.size(); i++) {
            BovinaGreutateIstoric current = masuratori.get(i);

            BovinaGreutateResponseDto dto = new BovinaGreutateResponseDto();
            dto.setId(current.getId());
            dto.setBovinaId(current.getBovinaId());
            dto.setGreutate(current.getGreutate());
            dto.setDataMasuratoare(current.getDataMasuratoare());
            dto.setNota(current.getNota());

            // Calculează vârsta în zile la momentul măsurătorii
            if (bovina != null && bovina.getDateBirth() != null) {
                long zile = ChronoUnit.DAYS.between(
                        bovina.getDateBirth(),
                        current.getDataMasuratoare()
                );
                dto.setZileDeLaNastere(zile);
            }

            // Calculează câștigul mediu zilnic față de măsurătoarea anterioară
            if (i > 0) {
                BovinaGreutateIstoric previous = masuratori.get(i - 1);
                long zileIntre = ChronoUnit.DAYS.between(
                        previous.getDataMasuratoare(),
                        current.getDataMasuratoare()
                );

                if (zileIntre > 0) {
                    double diferenta = current.getGreutate() - previous.getGreutate();
                    double castigZilnic = diferenta / zileIntre;
                    dto.setCastigMediuZilnic(Math.round(castigZilnic * 100.0) / 100.0);
                }
            }

            result.add(dto);
        }

        return result;
    }

    // Șterge o măsurătoare
    @Transactional
    public void deleteMasuratoare(Long masuratoareId, Long bovinaId, Integer userId) {
        // Verifică dacă bovina există
        if (!bovinaRepository.findByUserIdAndId(userId, bovinaId).isPresent()) {
            throw new IllegalArgumentException("Bovina nu a fost găsită");
        }

        greutateRepository.deleteById(masuratoareId);

        // Actualizează greutatea curentă cu ultima măsurătoare rămasă
        Bovina bovina = bovinaRepository.findByUserIdAndId(userId, bovinaId).get();
        greutateRepository.findFirstByBovinaIdOrderByDataMasuratoareDesc(bovinaId)
                .ifPresent(ultima -> {
                    bovina.setGreutate(ultima.getGreutate());
                    bovinaRepository.save(bovina);
                });
    }
}