package com.manager.farm.pages.retetaPage.queryDto;

import com.manager.farm.pages.retetaPage.Reteta;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RetetaRepository extends CrudRepository<Reteta, Long> {

    // Găsește toate rețetele pentru un user
    List<Reteta> findByUserId(Integer userId);

    // Găsește o rețetă specifică pentru un user
    Optional<Reteta> findByUserIdAndId(Integer userId, Long id);

    // Verifică dacă există deja o rețetă cu același nume pentru user
    boolean existsByUserIdAndNume(Integer userId, String nume);

    // Șterge toate rețetele pentru un user
    void deleteByUserId(Integer userId);
}