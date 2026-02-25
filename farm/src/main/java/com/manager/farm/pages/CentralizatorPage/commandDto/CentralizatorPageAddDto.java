package com.manager.farm.pages.CentralizatorPage.commandDto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CentralizatorPageAddDto {

    @NotNull(message = "Tipul de furaj este obligatoriu")
    private Long tipMagazieId;

    @Min(value = 0, message = "Stocul inițial nu poate fi negativ")
    private Integer stocInitial = 0;

    @Min(value = 0, message = "Intrările nu pot fi negative")
    private Integer intrari = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vaciLapte = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vaciGestante = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer juniciGestante = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer alteVaci = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer viteleMontate = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer junici = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vitele6_12Luni = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vitele3_6Luni = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vitele0_3Luni = 0;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer taurasi = 0;

    private String observatii;

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;

    @NotNull(message = "Luna este obligatorie")
    @Min(value = 1, message = "Luna trebuie să fie între 1 și 12")
    private Integer month;

    @NotNull(message = "Anul este obligatoriu")
    @Min(value = 2000, message = "Anul trebuie să fie mai mare sau egal cu 2000")
    private Integer year;
}