package com.althea.catalog.repository;

import com.althea.catalog.model.HomepageText;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomepageTextRepository extends JpaRepository<HomepageText, Integer> {

    // récupérer tous les textes actifs
    List<HomepageText> findByActiveTrue();
}