package com.manager.farm.pages.bovinePage.queryDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BovinaResponseDto {
    private Long id;
    private Integer userId;
    private LocalDate dateBirth;
    private Boolean isMale;
    private String sex;  // "Mascul" sau "Femelă"
    private Double greutate;  // NOU: greutatea în kg
    private Integer nrFatari;
    private Integer productieLapte;
    private String nota;
    private String location;
    private Boolean isObserved;
    private String status;  // "Tanăr", "Adult", "Bătrân" (calculat din vârstă)

    // Informații despre rasă
    private Long tipBovinaId;
    private String tipBovinaNume;

    // Informații despre rețetă
    private Long retetaId;
    private String retetaNume;
}