package com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.commandDto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class TipEvenimentEditDto {

        private String nume;

        @Min(value = 1, message = "Durata trebuie să fie mai mare decât 0")
        private Integer duration;
}