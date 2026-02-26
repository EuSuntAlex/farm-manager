package com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.service;

import com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.TipEveniment;
import com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.queryDto.TipEvenimentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class TipEvenimentInitializareService {

    private final TipEvenimentRepository tipEvenimentRepository;

    public TipEvenimentInitializareService(TipEvenimentRepository tipEvenimentRepository) {
        this.tipEvenimentRepository = tipEvenimentRepository;
    }

    /**
     * Creează tipurile de evenimente implicite pentru un utilizator nou
     */
    @Transactional
    public List<TipEveniment> initializeazaTipuriImplicite(Integer userId) {
        // Verifică dacă utilizatorul are deja tipuri
        List<TipEveniment> existente = tipEvenimentRepository.findByUserId(userId);
        if (!existente.isEmpty()) {
            return existente; // Returnăm cele existente
        }

        // ID-uri fixe de la 1 la 9 pentru tipurile implicite
        List<TipEveniment> tipuriImplicite = Arrays.asList(
                new TipEveniment(null, "Bolnavă", 3650, userId),
                new TipEveniment(null, "Gestantă", 280, userId),
                new TipEveniment(null, "Însămânțare", 1, userId),
                new TipEveniment(null, "Avort", 0, userId),
                new TipEveniment(null, "Vaccinare", 365, userId),
                new TipEveniment(null, "Control sanitar", 1, userId),
                new TipEveniment(null, "Separare", 30, userId),
                new TipEveniment(null, "Alăptare", 60, userId),
                new TipEveniment(null, "Uscare", 60, userId)
        );

        // Salvare în baza de date
        for (TipEveniment tip : tipuriImplicite) {
            tip.setUserId(userId);
            tipEvenimentRepository.save(tip);
        }

        return tipuriImplicite;
    }

    /**
     * Resetează tipurile implicite pentru un user (șterge toate și adaugă din nou)
     */
    @Transactional
    public List<TipEveniment> reseteazaTipuriImplicite(Integer userId) {
        tipEvenimentRepository.deleteByUserId(userId);
        return initializeazaTipuriImplicite(userId);
    }
}