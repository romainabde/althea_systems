package com.althea.catalog.repository;

import com.althea.catalog.model.Footer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FooterRepository extends JpaRepository<Footer, Integer> {

    // récupérer le footer actif
    Footer findFirstByActiveTrue();
}