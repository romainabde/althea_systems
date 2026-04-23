package com.althea.admin.mapper;

import com.althea.admin.dto.home.FooterUpdateRequest;
import com.althea.shared.model.Footer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface FooterMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Footer entity, FooterUpdateRequest request);
}