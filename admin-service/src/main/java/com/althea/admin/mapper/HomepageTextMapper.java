package com.althea.admin.mapper;

import com.althea.admin.dto.home.HomepageTextUpdateRequest;
import com.althea.shared.model.HomepageText;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HomepageTextMapper {

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget HomepageText entity,
                      HomepageTextUpdateRequest request);
}