package com.manager.farm.pages.CentralizatorPage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(schema = "pages", value = "centralizator")
public class CentralizatorPage {

    @Id
    private Long id;                    // se mapează automat la coloana "id"

    private Long tipMagazieId;          // se mapează automat la "tip_magazie_id"

    private Integer stocInitial;         // se mapează automat la "stoc_initial"

    private Integer intrari;             // se mapează automat la "intrari"

    private Integer vaciLapte;           // se mapează automat la "vaci_lapte"

    private Integer vaciGestante;        // se mapează automat la "vaci_gestante"

    private Integer juniciGestante;       // se mapează automat la "junici_gestante"

    private Integer alteVaci;            // se mapează automat la "alte_vaci"

    private Integer viteleMontate;        // se mapează automat la "vitele_montate"

    private Integer junici;               // se mapează automat la "junici"

    private Integer vitele_6_12Luni;       // se mapează automat la "vitele_6_12_luni"

    private Integer vitele_3_6Luni;        // se mapează automat la "vitele_3_6_luni"

    private Integer vitele_0_3Luni;        // se mapează automat la "vitele_0_3_luni"

    private Integer taurasi;              // se mapează automat la "taurasi"

    private String observatii;            // se mapează automat la "observatii"

    private Integer userId;                // se mapează automat la "user_id"

    private Integer month;                 // se mapează automat la "month"

    private Integer year;                  // se mapează automat la "year"
}