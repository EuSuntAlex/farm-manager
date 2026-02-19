package com.manager.farm.Pages.JurnalPage.queryDto;


import com.manager.farm.Pages.JurnalPage.JurnalPage;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JurnalPageRepository extends CrudRepository<JurnalPage, Long> {

    // Căutări după userId
    List<JurnalPage> findByUserId(Integer userId);

    // Căutări combinate cu userId
    List<JurnalPage> findByUserIdAndYear(Integer userId, Integer year);

    List<JurnalPage> findByUserIdAndMonthAndYear(Integer userId, Integer month, Integer year);

    List<JurnalPage> findByUserIdAndDayAndMonthAndYear(Integer userId, Integer day, Integer month, Integer year);

    // Verificare existență
    boolean existsByDayAndMonthAndYearAndUserId(Integer day, Integer month, Integer year, Integer userId);

    // Ștergere
    void deleteByUserIdAndDayAndMonthAndYear(Integer userId, Integer day, Integer month, Integer year);
}