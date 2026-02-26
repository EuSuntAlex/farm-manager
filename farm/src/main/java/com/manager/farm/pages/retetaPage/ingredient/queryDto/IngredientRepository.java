package com.manager.farm.pages.retetaPage.ingredient.queryDto;

import com.manager.farm.pages.retetaPage.ingredient.Ingredient;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends CrudRepository<Ingredient, Long> {

    // Găsește toate ingredientele pentru un user
    List<Ingredient> findByUserId(Integer userId);

    // Găsește un ingredient specific pentru un user
    Optional<Ingredient> findByUserIdAndId(Integer userId, Long id);

    // Verifică dacă există deja un ingredient cu același nume pentru user
    boolean existsByUserIdAndName(Integer userId, String name);

    // Găsește după nume care conține (căutare parțială)
    List<Ingredient> findByUserIdAndNameContaining(Integer userId, String name);

    // Șterge toate ingredientele pentru un user
    void deleteByUserId(Integer userId);
}