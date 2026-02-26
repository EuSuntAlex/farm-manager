package com.manager.farm.pages.bovinePage.queryDto;

import com.manager.farm.pages.bovinePage.Bovina;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BovinaPageRepository extends CrudRepository<Bovina, Integer> {

    // Găsește toate bovinele
    List<Bovina> findAll();

    // Găsește bovine după sex
    List<Bovina> findByIsMale(boolean isMale);

    // Găsește bovine după rasă
    List<Bovina> findByRasa(String rasa);

    // Găsește bovine după locație
    List<Bovina> findByLocation(String location);

    // Găsește bovine după status gestație
    List<Bovina> findByStatusGestatie(String statusGestatie);

    // Găsește bovine gestante (statusGestatie not null)
    List<Bovina> findByStatusGestatieIsNotNull();

    // Găsește bovine după data nașterii
    List<Bovina> findByDateBirth(LocalDate dateBirth);

    // Găsește bovine născute într-un interval
    List<Bovina> findByDateBirthBetween(LocalDate startDate, LocalDate endDate);

    // Găsește bovine cu producție de lapte peste o valoare
    List<Bovina> findByProductieLapteGreaterThan(int productie);

    // Găsește bovine care urmează să fete (prognoza în viitor)
    List<Bovina> findByPrognozaAfter(LocalDate date);

    // Găsește bovine după numărul de fătări
    List<Bovina> findByNrFatari(int nrFatari);

    // Găsește bovine cu număr de fătări între două valori
    List<Bovina> findByNrFatariBetween(int min, int max);

    // Numără bovine după locație
    long countByLocation(String location);

    // Numără bovine după sex
    long countByIsMale(boolean isMale);

    // Numără bovine după rasă
    long countByRasa(String rasa);

    // Șterge o bovină după ID (cu verificare)
    void deleteById(int id);

    // Verifică dacă există o bovină cu un anumit ID
    boolean existsById(int id);
}