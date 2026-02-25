package com.manager.farm.pages.JurnalPage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "pages", value = "jurnal")
@Getter
@Setter
public class JurnalPage {

    @Id
    private int id;
    private int nrAnimale;
    private int mulsoare1;
    private int mulsoare2;
    private int valoarePredata;
    private String destinatar; //  Nomenclator
    private int lapteVitei;
    private int vanzareExterna; // schimbare denumiri ca in excell
    private String vanzareExternaDestinatar;

    private int day;
    private int month;
    private int year;
    private int userId;
}

