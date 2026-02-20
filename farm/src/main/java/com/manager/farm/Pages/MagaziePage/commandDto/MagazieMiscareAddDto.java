package com.manager.farm.Pages.MagaziePage.commandDto;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MagazieMiscareAddDto {

    @NotNull(message = "Tipul magaziei este obligatoriu")
    private Long tipMagazieId;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    @Min(value = 1, message = "ID-ul utilizatorului trebuie să fie pozitiv")
    private Integer userId;

    @Size(max = 255, message = "Furnizorul nu poate depăși 255 de caractere")
    private String furnizor; // opțional

    @NotNull(message = "Ziua este obligatorie")
    @Min(value = 1, message = "Ziua trebuie să fie între 1-31")
    @Max(value = 31, message = "Ziua trebuie să fie între 1-31")
    private Integer day;

    @NotNull(message = "Luna este obligatorie")
    @Min(value = 1, message = "Luna trebuie să fie între 1-12")
    @Max(value = 12, message = "Luna trebuie să fie între 1-12")
    private Integer month;

    @NotNull(message = "Anul este obligatoriu")
    @Min(value = 2020, message = "Anul trebuie să fie 2020 sau mai mare")
    private Integer year;

    @Min(value = 0, message = "Intrările nu pot fi negative")
    private Double intrari = 0.0;

    @Min(value = 0, message = "Ieșirile nu pot fi negative")
    private Double iesiri = 0.0;
}