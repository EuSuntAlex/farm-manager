package com.manager.farm.pages.JurnalPage.commandDto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class JurnalPageEditDto {

    @Min(value = 0, message = "Numărul de animale nu poate fi negativ")
    private Integer nrAnimale;

    @Min(value = 0, message = "Cantitatea nu poate fi negativă")
    private Integer mulsoare1;

    @Min(value = 0, message = "Cantitatea nu poate fi negativă")
    private Integer mulsoare2;

    @Min(value = 0, message = "Valoarea predată nu poate fi negativă")
    private Integer valoarePredata;

    @NotNull(message = "Destinatarul este obligatoriu")
    @NotBlank(message = "Destinatarul nu poate fi gol")
    @Size(max = 255, message = "Destinatarul nu poate depăși 255 de caractere")
    private String destinatar;

    @Min(value = 0, message = "Laptele pentru viței nu poate fi negativ")
    private Integer lapteVitei;

    // NOI CÂMPURI OPȚIONALE
    @Min(value = 0, message = "Vânzarea externă nu poate fi negativă")
    private Integer vanzareExterna;

    @Size(max = 255, message = "Destinatarul vânzării externe nu poate depăși 255 de caractere")
    private String vanzareExternaDestinatar;

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

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    @Min(value = 1, message = "ID-ul utilizatorului trebuie să fie pozitiv")
    private Integer userId;
}
