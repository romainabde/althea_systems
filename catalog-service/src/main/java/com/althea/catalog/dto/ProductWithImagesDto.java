package com.althea.catalog.dto;

import com.althea.catalog.dto.common.ProductDto;
import com.althea.catalog.model.ProductImage;

import java.util.List;

public record ProductWithImagesDto(ProductDto product, List<ProductImage> productImage) {
}
