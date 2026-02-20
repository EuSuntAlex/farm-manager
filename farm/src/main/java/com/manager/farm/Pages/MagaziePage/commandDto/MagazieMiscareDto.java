package com.manager.farm.Pages.MagaziePage.commandDto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MagazieMiscareDto {

    private Long tipMagazieId;

    private Integer userId;

    private String furnizor; // opțional

    private Integer day;
    private Integer month;
    private Integer year;

    private Double intrari;
    private Double iesiri;
}