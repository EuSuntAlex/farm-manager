package com.manager.farm.pages.evenimentPage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(schema = "pages", value = "eveniment")
public class Eveniment {
    @Id
    private Long id;
    private int tipEvenimentId;
    private String title;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private Integer bovinaId;  // ← NOU: pentru legătura cu bovinele
    private int userId;

    // Metodă pentru a calcula automat data de sfârșit
    public void calculeazaDataSfarsit(int durataZile) {
        if (dateStart != null) {
            this.dateEnd = dateStart.plusDays(durataZile);
        }
    }
}