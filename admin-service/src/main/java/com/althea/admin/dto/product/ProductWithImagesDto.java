package com.althea.admin.dto.product;

import com.althea.admin.dto.common.ProductDto;
import com.althea.shared.dto.ProductImageView;

import java.util.List;

public record ProductWithImagesDto(ProductDto product, List<ProductImageView> images) {
}
