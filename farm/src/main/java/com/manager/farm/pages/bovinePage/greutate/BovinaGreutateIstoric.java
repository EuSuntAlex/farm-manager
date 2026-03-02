package com.manager.farm.pages.bovinePage.greutate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "pages", value = "bovina_greutate_istorice")
@Getter
@Setter
public class BovinaGreutateIstoric {

    @Id
    private Long id;

    private Long bovinaId;  // FK către Bovina

    private Double greutate;  // Greutatea la momentul respectiv

    private LocalDate dataMasuratoare;  // Data când s-a făcut măsurătoarea

    private String nota;  // Observații (opțional)

    private LocalDateTime createdAt;  // Data înregistrării în sistem
}