package com.althea.admin.mapper;

import com.althea.admin.dto.common.UserAddressDto;
import com.althea.admin.dto.common.UserDto;
import com.althea.admin.dto.common.UserPurchaseDto;
import com.althea.admin.dto.user.UserUpdateRequest;
import com.althea.shared.model.Address;
import com.althea.shared.model.Order;
import com.althea.shared.model.User;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toDto(User user);

    List<UserDto> toDto(List<User> users);

    UserAddressDto toAddressDto(Address address);

    List<UserAddressDto> toAddressDto(List<Address> addresses);

    @Mapping(source = "id", target = "orderId")
    @Mapping(target = "itemCount", expression = "java(order.getItems() == null ? 0 : order.getItems().size())")
    UserPurchaseDto toPurchaseDto(Order order);

    List<UserPurchaseDto> toPurchaseDto(List<Order> orders);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    @Mapping(target = "orders", ignore = true)
    void updateEntity(@MappingTarget User entity, UserUpdateRequest request);
}
