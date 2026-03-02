package com.manager.farm.pages.bovinePage.tipBovina.queryDto;

import com.manager.farm.pages.bovinePage.tipBovina.TipBovina;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipBovinaRepository extends CrudRepository<TipBovina, Long> {

    // Găsește toate rasele pentru un user
    List<TipBovina> findByUserId(Integer userId);

    // Găsește o rasă specifică pentru un user
    Optional<TipBovina> findByUserIdAndId(Integer userId, Long id);

    // Verifică dacă există deja o rasă cu același nume pentru user
    boolean existsByUserIdAndName(Integer userId, String name);

    // Găsește după nume care conține (căutare parțială)
    List<TipBovina> findByUserIdAndNameContaining(Integer userId, String name);

    // Șterge toate rasele pentru un user
    void deleteByUserId(Integer userId);
}