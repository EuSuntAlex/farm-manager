package com.manager.farm.Pages.JurnalPage;

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
    private String destinatar;
    private int lapteVitei;
    private int vanzareExterna;
    private String vanzareExternaDestinatar;

    private int day;
    private int month;
    private int year;
    private int userId;
}

