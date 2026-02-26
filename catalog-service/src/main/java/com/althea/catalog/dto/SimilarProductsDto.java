package com.althea.catalog.dto;

import com.althea.catalog.dto.common.ProductDto;

import java.util.List;

public record SimilarProductsDto (Integer productId, List<ProductDto> similarProducts) {
}
