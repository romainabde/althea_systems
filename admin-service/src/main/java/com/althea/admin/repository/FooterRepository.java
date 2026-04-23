package com.althea.admin.repository;

import com.althea.shared.model.Footer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FooterRepository extends JpaRepository<Footer, Integer> {

    // récupérer le footer actif
    Footer findFirstByActiveTrue();
}