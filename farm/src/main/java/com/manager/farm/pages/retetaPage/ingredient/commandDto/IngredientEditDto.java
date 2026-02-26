package com.manager.farm.pages.retetaPage.ingredient.commandDto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class IngredientEditDto {

    private String name;

    private String unitateMasura;

    @Min(value = 0, message = "Prețul nu poate fi negativ")
    private Integer price;
}