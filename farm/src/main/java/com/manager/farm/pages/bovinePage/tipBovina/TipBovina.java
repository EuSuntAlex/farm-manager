package com.manager.farm.pages.bovinePage.tipBovina;

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
@Table(schema = "pages", value = "tipbovina")
public class TipBovina {
    @Id
    private Long id;  // Schimbat din int în Long pentru consistency
    private String name;
    private Integer defaultRetetaId;
    private Integer userId;
}