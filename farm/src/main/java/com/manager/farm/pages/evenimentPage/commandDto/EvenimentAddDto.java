package com.manager.farm.pages.evenimentPage.commandDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class EvenimentAddDto {

    @NotNull(message = "ID-ul tipului de eveniment este obligatoriu")
    private Integer tipEvenimentId;

    @NotBlank(message = "Titlul evenimentului este obligatoriu")
    private String title;

    @NotNull(message = "Data de start este obligatorie")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateStart;

    private Long bovinaId;  // ← NOU: opțional

    @NotNull(message = "ID-ul utilizatorului este obligatoriu")
    private Integer userId;
}