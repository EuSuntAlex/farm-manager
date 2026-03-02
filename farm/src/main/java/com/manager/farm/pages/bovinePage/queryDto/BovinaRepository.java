package com.manager.farm.pages.bovinePage.queryDto;

import com.manager.farm.pages.bovinePage.Bovina;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BovinaRepository extends CrudRepository<Bovina, Long> {

    // Găsește toate bovinele pentru un user
    List<Bovina> findByUserId(Integer userId);

    // Găsește o bovină specifică pentru un user
    Optional<Bovina> findByUserIdAndId(Integer userId, Long id);

    // Găsește bovine după rasă
    List<Bovina> findByUserIdAndTipBovinaId(Integer userId, Long tipBovinaId);

    // Găsește bovine după sex
    List<Bovina> findByUserIdAndIsMale(Integer userId, Boolean isMale);

    // Găsește bovine după rețetă
    List<Bovina> findByUserIdAndRetetaId(Integer userId, Long retetaId);

    // Verifică dacă există bovine cu o anumită rasă
    boolean existsByUserIdAndTipBovinaId(Integer userId, Long tipBovinaId);

    // Verifică dacă există bovine cu o anumită rețetă
    boolean existsByUserIdAndRetetaId(Integer userId, Long retetaId);

    // Șterge toate bovinele pentru un user
    void deleteByUserId(Integer userId);
}