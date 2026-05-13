package com.althea.catalog.dto.product;

import com.althea.catalog.dto.common.ProductDto;
import com.althea.shared.model.ProductImage;

import java.util.List;

public record ProductWithImagesDto(ProductDto product, List<ProductImage> images) {
}
