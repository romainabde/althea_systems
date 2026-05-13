package com.althea.admin.repository;

import com.althea.shared.model.TopProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopProductRepository extends JpaRepository<TopProduct, Integer> {

    List<TopProduct> findAllByActiveTrueOrderByDisplayOrderAsc();

    boolean existsByProduct_Id(Integer productId);
}