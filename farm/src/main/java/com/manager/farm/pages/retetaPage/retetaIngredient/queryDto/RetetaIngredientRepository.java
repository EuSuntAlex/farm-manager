package com.manager.farm.pages.retetaPage.retetaIngredient.queryDto;

import com.manager.farm.pages.retetaPage.retetaIngredient.RetetaIngredient;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RetetaIngredientRepository extends CrudRepository<RetetaIngredient, Long> {

    List<RetetaIngredient> findByRetetaId(Long retetaId);

    void deleteByRetetaId(Long retetaId);

    boolean existsByIngredientId(Long ingredientId);

    // Adăugat pentru service
    List<RetetaIngredient> findByIngredientId(Long ingredientId);
}