package com.althea.catalog.repository;

import com.althea.shared.model.ProductImage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface ProductImageRepository extends MongoRepository<ProductImage, String> {
    List<ProductImage> findByProductId(Integer productId);

    List<ProductImage> findByProductIdIn(Collection<Integer> productIds);
}
