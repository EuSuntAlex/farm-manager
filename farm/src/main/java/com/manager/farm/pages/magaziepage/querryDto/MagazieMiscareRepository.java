package com.manager.farm.pages.magaziepage.querryDto;

import com.manager.farm.pages.magaziepage.MagazieMiscare;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface MagazieMiscareRepository extends CrudRepository<MagazieMiscare, Long> {

    List<MagazieMiscare> findByUserIdAndTipMagazieIdOrderByYearDescMonthDescDayDesc(
            Integer userId, Long tipMagazieId);

    List<MagazieMiscare> findByUserIdAndTipMagazieIdAndYearOrderByMonthAscDayAsc(
            Integer userId, Long tipMagazieId, Integer year);

    List<MagazieMiscare> findByUserIdAndTipMagazieIdAndYearAndMonthOrderByDayAsc(
            Integer userId, Long tipMagazieId, Integer year, Integer month);

    Optional<MagazieMiscare> findTopByUserIdAndTipMagazieIdOrderByYearDescMonthDescDayDesc(
            Integer userId, Long tipMagazieId);

    boolean existsByUserIdAndTipMagazieId(Integer userId, Long tipMagazieId);
}