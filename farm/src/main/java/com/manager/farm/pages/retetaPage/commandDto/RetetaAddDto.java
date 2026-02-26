package com.manager.farm.pages.retetaPage.commandDto;

import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class RetetaAddDto {

    @NotBlank(message = "Numele rețetei este obligatoriu")
    private String nume;

    private String descriere;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;

    @NotNull(message = "Lista de ingrediente este obligatorie")
    @Size(min = 1, message = "Rețeta trebuie să aibă cel puțin un ingredient")
    private List<RetetaIngredientDto> ingrediente;
}