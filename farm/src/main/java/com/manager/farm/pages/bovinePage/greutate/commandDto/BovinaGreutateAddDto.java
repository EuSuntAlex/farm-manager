package com.manager.farm.pages.bovinePage.greutate.commandDto;

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
public class BovinaGreutateAddDto {

    @NotNull(message = "ID-ul bovinei este obligatoriu")
    private Long bovinaId;

    @NotNull(message = "Greutatea este obligatorie")
    private Double greutate;

    @NotNull(message = "Data măsurătorii este obligatorie")
    private LocalDate dataMasuratoare;

    private String nota;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;  // Pentru verificare proprietate
}