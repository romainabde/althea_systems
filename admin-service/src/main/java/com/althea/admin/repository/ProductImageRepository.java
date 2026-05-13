package com.althea.admin.repository;

import com.althea.shared.model.ProductImage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends MongoRepository<ProductImage, String> {
    List<ProductImage> findByProductId(Integer productId);

    List<ProductImage> findByProductIdIn(Collection<Integer> productIds);

    Optional<ProductImage> findByIdAndProductId(String id, Integer productId);
}
