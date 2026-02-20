package com.manager.farm.Pages.MagaziePage.TipMagazie;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "pages", value = "tip_magazie")
@Getter
@Setter

public class TipMagazie {

    @Id
    private Long id;

    private String cod; // ex: "FURAJE", "LAPTE", "UTILAJE"

    private String denumire; // ex: "Furaje", "Lapte", "Utilaje"

    private String unitateMasura; // ex: "kg", "litri", "bucati"

    private Integer userId; // Fiecare user are propriile tipuri

}
