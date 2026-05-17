package com.althea.admin.mapper;

import com.althea.admin.dto.home.CarouselSectionCreateRequest;
import com.althea.admin.dto.home.CarouselSectionUpdateRequest;
import com.althea.shared.model.CarouselSection;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CarouselSectionMapper {

    // =========================
    // CREATE
    // =========================
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CarouselSection toEntity(CarouselSectionCreateRequest request);

    // =========================
    // UPDATE PARTIEL
    // =========================
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget CarouselSection entity,
                      CarouselSectionUpdateRequest request);
}
