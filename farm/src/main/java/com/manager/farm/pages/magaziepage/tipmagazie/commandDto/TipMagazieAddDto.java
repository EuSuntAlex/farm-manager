package com.manager.farm.pages.magaziepage.tipmagazie.commandDto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TipMagazieAddDto {

    @NotNull(message = "Codul este obligatoriu")
    @Size(min = 2, max = 50, message = "Codul trebuie să aibă între 2 și 50 de caractere")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Codul poate conține doar litere mari, cifre și underscore")
    private String cod;

    @NotNull(message = "Denumirea este obligatorie")
    @Size(min = 3, max = 255, message = "Denumirea trebuie să aibă între 3 și 255 de caractere")
    private String denumire;

    @NotNull(message = "Unitatea de măsură este obligatorie")
    @Pattern(regexp = "^(kg|litri|bucati|metri)$",
            message = "Unitatea de măsură trebuie să fie: kg, litri, bucati, metri")
    private String unitateMasura;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    @Min(value = 1, message = "ID-ul utilizatorului trebuie să fie pozitiv")
    private Integer userId;
}