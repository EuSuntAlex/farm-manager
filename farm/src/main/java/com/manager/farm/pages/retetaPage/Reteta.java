package com.manager.farm.pages.retetaPage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(schema = "pages", value = "reteta")
public class Reteta {
    @Id
    private Long id;
    private String nume;
    private String descriere;
    private LocalDateTime dataCreare;
    private Integer userId;
}