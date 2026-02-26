package com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.queryDto;

import com.manager.farm.pages.bovinePage.evenimentPage.tipEveniment.TipEveniment;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipEvenimentRepository extends CrudRepository<TipEveniment, Long> {

    // Găsește toate tipurile pentru un user
    List<TipEveniment> findByUserId(Integer userId);

    // Găsește un tip specific pentru un user
    Optional<TipEveniment> findByUserIdAndId(Integer userId, Long id);

    // Verifică dacă există deja un tip cu același nume pentru user
    boolean existsByUserIdAndNume(Integer userId, String nume);

    // Găsește după nume (căutare exactă) pentru un user
    List<TipEveniment> findByUserIdAndNume(Integer userId, String nume);

    // Găsește după nume care conține (căutare parțială) pentru un user
    List<TipEveniment> findByUserIdAndNumeContaining(Integer userId, String nume);

    // Șterge toate tipurile pentru un user
    void deleteByUserId(Integer userId);
}