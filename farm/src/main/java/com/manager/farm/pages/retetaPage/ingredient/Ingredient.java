package com.manager.farm.pages.retetaPage.ingredient;

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
@Table(schema = "pages", value = "ingredient")
public class Ingredient {

    @Id
    private int id;
    private String name;
    private String unitateMasura;
    private int price;
    private int userId;
}
