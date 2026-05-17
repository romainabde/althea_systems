package com.althea.admin.mapper;

import com.althea.admin.dto.home.TopProductRequest;
import com.althea.shared.model.TopProduct;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TopProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TopProduct toEntity(TopProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget TopProduct entity,
                      TopProductRequest request);
}
