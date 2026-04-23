package com.althea.admin.mapper;

import com.althea.admin.dto.common.OrderDetailDto;
import com.althea.admin.dto.common.OrderItemDto;
import com.althea.admin.dto.common.OrderSummaryDto;
import com.althea.shared.model.Order;
import com.althea.shared.model.OrderItem;
import com.althea.shared.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(target = "userEmail", expression = "java(order.getUser() != null ? order.getUser().getEmail() : order.getGuestEmail())")
    @Mapping(target = "itemCount", expression = "java(order.getItems() == null ? 0 : order.getItems().size())")
    OrderSummaryDto toSummaryDto(Order order);

    List<OrderSummaryDto> toSummaryDto(List<Order> orders);

    OrderItemDto toItemDto(OrderItem item);

    List<OrderItemDto> toItemDto(List<OrderItem> items);

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userFullName")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "address.id", target = "addressId")
    @Mapping(source = "address.firstName", target = "addressFirstName")
    @Mapping(source = "address.lastName", target = "addressLastName")
    @Mapping(source = "address.street", target = "addressStreet")
    @Mapping(source = "address.city", target = "addressCity")
    @Mapping(source = "address.zipCode", target = "addressZipCode")
    @Mapping(source = "address.country", target = "addressCountry")
    @Mapping(source = "address.phone", target = "addressPhone")
    @Mapping(source = "items", target = "items")
    @Mapping(target = "paymentId", expression = "java(payment != null ? payment.getId() : null)")
    @Mapping(target = "paymentStatus", expression = "java(payment != null ? payment.getStatus() : null)")
    OrderDetailDto toDetailDto(Order order, Payment payment);
}
