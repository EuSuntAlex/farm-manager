package com.manager.farm.pages.evenimentPage.tipEveniment.commandDto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class TipEvenimentEditDto {

        private String nume;


        @Min(value = 0, message = "Durata trebuie să fie cel putin 0")
        private Integer duration;
}