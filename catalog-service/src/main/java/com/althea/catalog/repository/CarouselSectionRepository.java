package com.althea.catalog.repository;

import com.althea.catalog.model.CarouselSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarouselSectionRepository extends JpaRepository<CarouselSection, Integer> {

    // récupérer toutes les sections actives triées par displayOrder
    List<CarouselSection> findByActiveTrueOrderByDisplayOrderAsc();
}