package com.manager.farm.pages.CentralizatorPage.queryDto;

import com.manager.farm.pages.CentralizatorPage.CentralizatorPage;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CentralizatorPageRepository extends CrudRepository<CentralizatorPage, Long> {

    // Găsește toate înregistrările pentru un user
    List<CentralizatorPage> findByUserId(Integer userId);

    // Găsește înregistrările pentru o lună/an
    List<CentralizatorPage> findByUserIdAndMonthAndYear(Integer userId, Integer month, Integer year);

    // Găsește înregistrările pentru un an
    List<CentralizatorPage> findByUserIdAndYear(Integer userId, Integer year);

    // Găsește o înregistrare specifică pentru un tip de furaj într-o lună
    Optional<CentralizatorPage> findByUserIdAndTipMagazieIdAndMonthAndYear(
            Integer userId, Long tipMagazieId, Integer month, Integer year);

    // Verifică dacă există deja o înregistrare
    boolean existsByUserIdAndTipMagazieIdAndMonthAndYear(
            Integer userId, Long tipMagazieId, Integer month, Integer year);

    // Găsește cea mai recentă înregistrare pentru un tip înainte de o anumită lună
    Optional<CentralizatorPage> findFirstByUserIdAndTipMagazieIdAndYearLessThanOrderByYearDescMonthDesc(
            Integer userId, Long tipMagazieId, Integer year);

    Optional<CentralizatorPage> findFirstByUserIdAndTipMagazieIdAndYearAndMonthLessThanOrderByMonthDesc(
            Integer userId, Long tipMagazieId, Integer year, Integer month);

    // Șterge o înregistrare (cu verificare userId)
    void deleteByUserIdAndId(Integer userId, Long id);

    // Găsește toate înregistrările pentru o lună, ordonate după tip
    List<CentralizatorPage> findByUserIdAndMonthAndYearOrderByTipMagazieIdAsc(
            Integer userId, Integer month, Integer year);

    // Găsește toate lunile în care există înregistrări pentru un an
    List<Integer> findDistinctMonthByUserIdAndYearOrderByMonthAsc(Integer userId, Integer year);

    // Găsește toți anii în care există înregistrări
    List<Integer> findDistinctYearByUserIdOrderByYearDesc(Integer userId);
}