package com.althea.catalog.dto.product;

import com.althea.catalog.dto.common.ProductDto;
import com.althea.shared.dto.ProductImageView;

import java.util.List;

public record ProductWithImagesDto(ProductDto product, List<ProductImageView> images) {
}
