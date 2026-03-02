package com.manager.farm.pages.evenimentPage.tipEveniment;

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
@Table(schema = "pages", value = "tipeveniment")
public class TipEveniment {
    @Id
    private Long id;  // Dacă setezi manual, Spring Data JDBC va folosi valoarea furnizată
    private String nume;
    private int duration;
    private Integer userId;
}