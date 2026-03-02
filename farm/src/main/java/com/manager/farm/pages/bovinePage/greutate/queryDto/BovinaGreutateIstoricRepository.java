package com.manager.farm.pages.bovinePage.greutate.queryDto;

import com.manager.farm.pages.bovinePage.greutate.BovinaGreutateIstoric;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BovinaGreutateIstoricRepository extends CrudRepository<BovinaGreutateIstoric, Long> {

    // Toate măsurătorile pentru o bovină, ordonate cronologic
    List<BovinaGreutateIstoric> findByBovinaIdOrderByDataMasuratoareAsc(Long bovinaId);

    // Ultima măsurătoare pentru o bovină
    Optional<BovinaGreutateIstoric> findFirstByBovinaIdOrderByDataMasuratoareDesc(Long bovinaId);

    // Măsurători într-un interval de date
    List<BovinaGreutateIstoric> findByBovinaIdAndDataMasuratoareBetween(
            Long bovinaId,
            LocalDate startDate,
            LocalDate endDate
    );

    // Șterge toate măsurătorile pentru o bovină
    void deleteByBovinaId(Long bovinaId);
}