package com.manager.farm.pages.retetaPage.commandDto;

import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientDto;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RetetaEditDto {

    private String nume;

    private String descriere;

    @Size(min = 1, message = "Rețeta trebuie să aibă cel puțin un ingredient")
    private List<RetetaIngredientDto> ingrediente;
}