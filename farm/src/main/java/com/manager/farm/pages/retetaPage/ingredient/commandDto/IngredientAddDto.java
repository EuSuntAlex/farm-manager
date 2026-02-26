package com.manager.farm.pages.retetaPage.ingredient.commandDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class IngredientAddDto {

    @NotBlank(message = "Numele ingredientului este obligatoriu")
    private String name;

    @NotBlank(message = "Unitatea de măsură este obligatorie")
    private String unitateMasura; // "kg", "litri", "bucati", "baloti"

    @NotNull(message = "Prețul este obligatoriu")
    @Min(value = 0, message = "Prețul nu poate fi negativ")
    private Integer price;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;
}