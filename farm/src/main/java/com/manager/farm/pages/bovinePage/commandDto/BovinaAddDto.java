package com.manager.farm.pages.bovinePage.commandDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BovinaAddDto {

    @NotNull(message = "Data nașterii este obligatorie")
    private LocalDate dateBirth;

    @NotBlank(message = "Rasa este obligatorie")
    private String rasa;

    @NotNull(message = "Sexul este obligatoriu")
    private Boolean isMale;

    private String statusGestatie; // null pentru masculi

    @Min(value = 0, message = "Numărul de fătări nu poate fi negativ")
    private Integer nrFatari;

    @Min(value = 0, message = "Zilele până la fătare nu pot fi negative")
    private Integer zilePanalaFatare;

    @Min(value = 0, message = "Zilele de la fătare nu pot fi negative")
    private Integer zileDelaFatare;

    @Min(value = 0, message = "Producția de lapte nu poate fi negativă")
    private Integer productieLapte;

    private boolean isObserved;

    private LocalDate prognoza;

    private String nota;

    private String location; // poate fi null/gol
}