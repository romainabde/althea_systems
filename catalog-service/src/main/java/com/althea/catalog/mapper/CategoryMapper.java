package com.althea.catalog.mapper;

import com.althea.catalog.dto.common.CategoryDto;
import com.althea.catalog.model.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryDto toDto(Category category);
    List<CategoryDto> toDto(List<Category> categories);

    Category toEntity(CategoryDto dto);
}