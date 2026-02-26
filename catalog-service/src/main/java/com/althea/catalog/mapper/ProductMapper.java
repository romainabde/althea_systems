package com.althea.catalog.mapper;

import com.althea.catalog.dto.common.ProductDto;
import com.althea.catalog.model.Product;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductDto toDto(Product product);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    List<ProductDto> toDto(List<Product> product);

    @Mapping(target = "category", ignore = true)
    Product toEntity(ProductDto dto);
}