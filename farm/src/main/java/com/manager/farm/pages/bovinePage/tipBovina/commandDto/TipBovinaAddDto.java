package com.manager.farm.pages.bovinePage.tipBovina.commandDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TipBovinaAddDto {

    @NotBlank(message = "Numele rasei este obligatoriu")
    private String name;

    private Integer defaultRetetaId;  // Opțional, poate fi null

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;
}