package com.althea.admin.mapper;

import com.althea.admin.dto.common.ContactMessageDto;
import com.althea.shared.model.ContactMessage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContactMessageMapper {
    ContactMessageDto toDto(ContactMessage entity);
    List<ContactMessageDto> toDto(List<ContactMessage> entities);
}
