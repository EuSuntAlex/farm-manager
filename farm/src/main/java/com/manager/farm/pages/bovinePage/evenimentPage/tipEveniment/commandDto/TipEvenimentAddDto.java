package com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.commandDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TipEvenimentAddDto {

    @NotBlank(message = "Numele evenimentului este obligatoriu")
    private String nume;

    @NotNull(message = "Durata este obligatorie")
    @Min(value = 1, message = "Durata trebuie să fie mai mare decât 0")
    private Integer duration;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;
}