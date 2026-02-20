package com.manager.farm.Pages.MagaziePage;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "pages", value = "magazie")
@Getter
@Setter

public class MagazieMiscare {

    @Id
    private Long id;

    private Long tipMagazieId; // FK către TipMagazie

    private Integer userId;

    private String furnizor;

    // DATA
    private Integer day;
    private Integer month;
    private Integer year;

    // MIȘCĂRI
    private Double intrari; // cantitate intrată (implicit 0)
    private Double iesiri; // cantitate ieșită (implicit 0)

    // SOLD (calculat automat)
    private Double stocFinal;
}