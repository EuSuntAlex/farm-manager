package com.manager.farm.Pages.MagaziePage.TipMagazie.querryDto;

import com.manager.farm.Pages.MagaziePage.TipMagazie.TipMagazie;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipMagazieRepository extends CrudRepository<TipMagazie, Long> {

    List<TipMagazie> findByUserId(Integer userId);

    Optional<TipMagazie> findByUserIdAndId(Integer userId, Long id);

    Optional<TipMagazie> findByUserIdAndCod(Integer userId, String cod);

    boolean existsByUserIdAndCod(Integer userId, String cod);

    void deleteByUserIdAndId(Integer userId, Long id);
}