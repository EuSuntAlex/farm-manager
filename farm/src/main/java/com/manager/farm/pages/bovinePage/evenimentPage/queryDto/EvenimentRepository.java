package com.manager.farm.pages.bovinePage.evenimentPage.queryDto;

import com.manager.farm.pages.bovinePage.evenimentPage.Eveniment;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvenimentRepository extends CrudRepository<Eveniment, Long> {

    // Găsește toate evenimentele pentru un user
    List<Eveniment> findByUserId(Integer userId);

    // Găsește un eveniment specific pentru un user
    Optional<Eveniment> findByUserIdAndId(Integer userId, Long id);

    // Găsește evenimente după tip
    List<Eveniment> findByUserIdAndTipEvenimentId(Integer userId, int tipEvenimentId);

    // Găsește evenimente într-un interval de date
    List<Eveniment> findByUserIdAndDateStartBetween(Integer userId, LocalDateTime start, LocalDateTime end);

    // Găsește evenimente care se termină într-un interval
    List<Eveniment> findByUserIdAndDateEndBetween(Integer userId, LocalDateTime start, LocalDateTime end);

    // Găsește evenimente viitoare (care nu au început încă)
    List<Eveniment> findByUserIdAndDateStartAfter(Integer userId, LocalDateTime now);

    // Găsește evenimente în desfășurare (start <= acum <= end)
    List<Eveniment> findByUserIdAndDateStartLessThanEqualAndDateEndGreaterThanEqual(
            Integer userId, LocalDateTime now1, LocalDateTime now2);

    // Verifică dacă există evenimente pentru un tip
    boolean existsByUserIdAndTipEvenimentId(Integer userId, int tipEvenimentId);

    // Șterge toate evenimentele pentru un user
    void deleteByUserId(Integer userId);
}