package com.althea.catalog.repository;

import com.althea.catalog.model.TopProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopProductRepository extends JpaRepository<TopProduct, Integer> {

    // récupérer tous les top produits actifs triés par displayOrder
    List<TopProduct> findByActiveTrueOrderByDisplayOrderAsc();
}