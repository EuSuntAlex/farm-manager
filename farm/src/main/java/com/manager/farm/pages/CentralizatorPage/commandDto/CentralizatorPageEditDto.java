package com.manager.farm.pages.CentralizatorPage.commandDto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CentralizatorPageEditDto {

    private Long tipMagazieId;

    @Min(value = 0, message = "Stocul inițial nu poate fi negativ")
    private Integer stocInitial;

    @Min(value = 0, message = "Intrările nu pot fi negative")
    private Integer intrari;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vaciLapte;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vaciGestante;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer juniciGestante;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer alteVaci;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer viteleMontate;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer junici;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vitele6_12Luni;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vitele3_6Luni;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer vitele0_3Luni;

    @Min(value = 0, message = "Consumul nu poate fi negativ")
    private Integer taurasi;

    private String observatii;
    private Integer userId;
    private Integer month;
    private Integer year;
}