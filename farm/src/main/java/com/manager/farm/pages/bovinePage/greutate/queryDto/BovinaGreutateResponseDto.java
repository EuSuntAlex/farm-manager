package com.manager.farm.pages.bovinePage.greutate.queryDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BovinaGreutateResponseDto {
    private Long id;
    private Long bovinaId;
    private Double greutate;
    private LocalDate dataMasuratoare;
    private String nota;
    private Long zileDeLaNastere;  // Câte zile avea bovina la măsurătoare
    private Double castigMediuZilnic;  // Diferența față de măsurătoarea anterioară / zile
}