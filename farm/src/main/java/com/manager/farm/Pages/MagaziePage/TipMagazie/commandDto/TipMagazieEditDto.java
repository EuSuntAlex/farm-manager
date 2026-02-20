package com.manager.farm.Pages.MagaziePage.TipMagazie.commandDto;

import jakarta.validation.constraints.Min;
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
public class TipMagazieEditDto {

    @Size(min = 2, max = 50, message = "Codul trebuie să aibă între 2 și 50 de caractere")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Codul poate conține doar litere mari, cifre și underscore")
    private String cod;

    @Size(min = 3, max = 255, message = "Denumirea trebuie să aibă între 3 și 255 de caractere")
    private String denumire;

    @Pattern(regexp = "^(kg|litri|bucati|metri)$",
            message = "Unitatea de măsură trebuie să fie: kg, litri, bucati, metri")
    private String unitateMasura;

    @Min(value = 1, message = "ID-ul utilizatorului trebuie să fie pozitiv")
    private Integer userId;
}