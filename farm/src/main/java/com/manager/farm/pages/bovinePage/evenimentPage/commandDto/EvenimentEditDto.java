package com.manager.farm.pages.bovinePage.evenimentPage.commandDto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class EvenimentEditDto {

    private Integer tipEvenimentId;

    private String title;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateStart;
}