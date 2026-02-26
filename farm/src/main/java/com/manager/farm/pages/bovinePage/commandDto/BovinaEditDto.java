package com.manager.farm.pages.bovinePage.commandDto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BovinaEditDto {

    private LocalDate dateBirth;

    private String rasa;

    private Boolean isMale;

    private String statusGestatie;

    @Min(value = 0, message = "Numărul de fătări nu poate fi negativ")
    private Integer nrFatari;

    @Min(value = 0, message = "Zilele până la fătare nu pot fi negative")
    private Integer zilePanalaFatare;

    @Min(value = 0, message = "Zilele de la fătare nu pot fi negative")
    private Integer zileDelaFatare;

    @Min(value = 0, message = "Producția de lapte nu poate fi negativă")
    private Integer productieLapte;

    private LocalDate prognoza;

    private String nota;

    private boolean isObserved;

    private String location;
}