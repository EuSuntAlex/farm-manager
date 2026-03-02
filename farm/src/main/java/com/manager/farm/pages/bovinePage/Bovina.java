package com.manager.farm.pages.bovinePage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "pages", value = "bovina")
@Getter
@Setter
public class Bovina {
    @Id
    private Long id;  // Schimbat din int în Long
    private Integer userId;
    private LocalDate dateBirth;
    private Boolean isMale;  // Boolean în loc de boolean pentru a permite null
    private Double greutate;  // NOU: greutatea în kg
    private Integer nrFatari;
    private Integer productieLapte;
    private String nota;
    private String location;
    private Boolean isObserved;
    private Long retetaId;  // FK către Reteta
    private Long tipBovinaId;  // FK către TipBovina
}