package com.manager.farm.listeners;

import com.manager.farm.pages.bovinePage.queryDto.BovinaRepository;
import com.manager.farm.pages.evenimentPage.Eveniment;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class EvenimentListener {

    private final BovinaRepository bovinaRepository;

    public EvenimentListener(BovinaRepository bovinaRepository) {
        this.bovinaRepository = bovinaRepository;
    }

    @EventListener
    @Transactional
    public void handleEvenimentCreated(EvenimentCreatedEvent event) {
        Eveniment eveniment = event.getEveniment();

        // Verifică dacă e eveniment de tip "Fătare" (poți verifica după ID sau nume)
        if (eveniment.getTipEvenimentId() == 4) { // ID-ul pentru "Fătare"
            bovinaRepository.findByUserIdAndId(eveniment.getUserId(), Long.valueOf(eveniment.getBovinaId()))
                    .ifPresent(bovina -> {
                        bovina.setNrFatari(bovina.getNrFatari() + 1);
                        bovinaRepository.save(bovina);
                    });
        }
    }
}