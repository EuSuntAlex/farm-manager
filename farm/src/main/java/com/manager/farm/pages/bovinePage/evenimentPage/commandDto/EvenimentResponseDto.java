package com.manager.farm.pages.bovinePage.evenimentPage.commandDto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EvenimentResponseDto {
    private Long id;
    private int tipEvenimentId;
    private String tipEvenimentNume; // Numele tipului de eveniment
    private int durata; // Durata în zile
    private String title;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private int userId;
    private String status; // "VIITOR", "IN_DESFASURARE", "INCHIS"
    private int zileRamase; // Pentru evenimente în desfășurare
}
