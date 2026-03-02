package com.manager.farm.pages.evenimentPage.commandDto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvenimentResponseDto {
    private Long id;
    private int tipEvenimentId;
    private String tipEvenimentNume;
    private int durata;
    private String title;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private int userId;
    private Long bovinaId;  // ← NOU
    private String status;
    private int zileRamase;
}