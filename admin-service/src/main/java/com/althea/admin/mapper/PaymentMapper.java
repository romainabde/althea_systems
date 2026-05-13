package com.althea.admin.mapper;

import com.althea.admin.dto.common.PaymentDto;
import com.althea.shared.model.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentDto toDto(Payment payment);
}
