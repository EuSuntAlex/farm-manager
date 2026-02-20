package com.manager.farm.Pages.MagaziePage;

import com.manager.farm.Pages.MagaziePage.commandDto.MagazieMiscareDto;
import com.manager.farm.Pages.MagaziePage.querryDto.MagazieMiscareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class MagazieMiscareService {

    @Autowired
    private MagazieMiscareRepository repository;

    public MagazieMiscare adaugaMiscare(MagazieMiscareDto dto) {
        // Validare simplă
        if (dto.getIntrari() == null) dto.setIntrari(0.0);
        if (dto.getIesiri() == null) dto.setIesiri(0.0);


        // Găsește ultimul stoc pentru acest tip de magazie
        Double ultimulStoc = getUltimulStoc(dto.getTipMagazieId(), dto.getUserId());

        // Calculează stoc final
        Double stocFinal = ultimulStoc + dto.getIntrari() - dto.getIesiri();

        // Verifică stoc negativ
        if (stocFinal < 0) {
            throw new RuntimeException("Stoc insuficient! Stoc curent: " + ultimulStoc +
                    ", încerci să scoți: " + dto.getIesiri());
        }

        // Creează și salvează entitatea
        MagazieMiscare miscare = new MagazieMiscare();
        miscare.setTipMagazieId(dto.getTipMagazieId());
        miscare.setUserId(dto.getUserId());
        miscare.setFurnizor(dto.getFurnizor());
        miscare.setDay(dto.getDay());
        miscare.setMonth(dto.getMonth());
        miscare.setYear(dto.getYear());
        miscare.setIntrari(dto.getIntrari());
        miscare.setIesiri(dto.getIesiri());
        miscare.setStocFinal(stocFinal);

        return repository.save(miscare);
    }

    private Double getUltimulStoc(Long tipMagazieId, Integer userId) {
        return repository.findTopByUserIdAndTipMagazieIdOrderByYearDescMonthDescDayDesc(userId, tipMagazieId)
                .map(MagazieMiscare::getStocFinal)
                .orElse(0.0);
    }

    // Poți adăuga și alte metode utile

    public Double getStocCurent(Long tipMagazieId, Integer userId) {
        return getUltimulStoc(tipMagazieId, userId);
    }

    public boolean tipMagazieAreMiscari(Long tipMagazieId, Integer userId) {
        return repository.existsByUserIdAndTipMagazieId(userId, tipMagazieId);
    }
}