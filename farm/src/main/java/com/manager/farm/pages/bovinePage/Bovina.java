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
@Table(schema = "pages", value = "bovine")
@Getter
@Setter
public class Bovina {
    @Id
    private int id;
    private int userId;
    private LocalDate dateBirth;
    private String rasa;
    private boolean isMale;
    private String statusGestatie;
    private int nrFatari;
    private int zile_panala_fatare;
    private int zile_dela_fatare;
    private int productieLapte;
    private LocalDate prognoza;
    private String nota;
    private String location;
    private boolean isObserved;
    // TODO: de adaugat eveniment

}
