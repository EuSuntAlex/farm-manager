package com.manager.farm.pages.retetaPage.queryDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RetetaResponseDto {
    private Long id;
    private String nume;
    private String descriere;
    private LocalDateTime dataCreare;
    private Integer userId;
    private List<IngredientInRetetaDto> ingrediente;
    private Double costTotal;

    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    public static class IngredientInRetetaDto {
        private Long ingredientId;
        private String numeIngredient;
        private String unitateMasura;
        private Double cantitate;
        private Integer pretPerUnitate;

        public Double getPretTotal() {
            return cantitate * pretPerUnitate;
        }
    }
}