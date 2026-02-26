package com.manager.farm.pages.retetaPage.retetaIngredient;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(schema = "pages", value = "reteta_ingredient")
public class RetetaIngredient {
    @Id
    private Long id;
    private Long retetaId;
    private Long ingredientId;
    private Double cantitate;
}