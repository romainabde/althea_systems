package com.althea.catalog.repository;

import com.althea.shared.model.TopProduct;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopProductRepository extends JpaRepository<TopProduct, Integer> {

    /** Charge la relation {@code product} pour éviter LazyInitializationException hors transaction. */
    @EntityGraph(attributePaths = {"product"})
    List<TopProduct> findByActiveTrueOrderByDisplayOrderAsc();
}