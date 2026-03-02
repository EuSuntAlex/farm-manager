package com.manager.farm.pages.bovinePage.commandDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BovinaAddDto {

    @NotNull(message = "Data nașterii este obligatorie")
    private LocalDate dateBirth;

    @NotNull(message = "Sexul este obligatoriu")
    private Boolean isMale;

    private Double greutate;  // NOU: greutatea în kg

    private Integer nrFatari;  // Opțional, default 0

    private Integer productieLapte;  // Opțional

    private String nota;

    private String location;

    private Boolean isObserved;  // Opțional, default false

    private Long retetaId;  // Opțional

    @NotNull(message = "ID-ul rasei este obligatoriu")
    private Long tipBovinaId;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;
}