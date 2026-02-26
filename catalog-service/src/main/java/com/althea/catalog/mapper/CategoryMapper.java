package com.althea.catalog.mapper;

import com.althea.catalog.dto.common.CategoryDto;
import com.althea.catalog.model.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDto toDto(Category category);

    Category toEntity(CategoryDto dto);
}