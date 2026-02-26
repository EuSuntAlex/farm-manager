package com.manager.farm.pages.retetaPage.retetaIngredient.commandDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RetetaIngredientDto {

    @NotNull(message = "ID-ul ingredientului este obligatoriu")
    private Long ingredientId;

    @NotNull(message = "Cantitatea este obligatorie")
    private Double cantitate;
}