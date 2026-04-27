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

    @Mapping(source = "order.id", target = "id")
    @Mapping(source = "order.user.id", target = "userId")
    @Mapping(source = "order.user.fullName", target = "userFullName")
    @Mapping(source = "order.user.email", target = "userEmail")
    @Mapping(source = "order.guestEmail", target = "guestEmail")
    @Mapping(source = "order.sessionId", target = "sessionId")
    @Mapping(source = "order.totalAmount", target = "totalAmount")
    @Mapping(source = "order.status", target = "status")
    @Mapping(source = "order.createdAt", target = "createdAt")
    @Mapping(source = "order.address.id", target = "addressId")
    @Mapping(source = "order.address.firstName", target = "addressFirstName")
    @Mapping(source = "order.address.lastName", target = "addressLastName")
    @Mapping(source = "order.address.street", target = "addressStreet")
    @Mapping(source = "order.address.city", target = "addressCity")
    @Mapping(source = "order.address.zipCode", target = "addressZipCode")
    @Mapping(source = "order.address.country", target = "addressCountry")
    @Mapping(source = "order.address.phone", target = "addressPhone")
    @Mapping(source = "order.items", target = "items")
    @Mapping(target = "paymentId", expression = "java(payment != null ? payment.getId() : null)")
    @Mapping(target = "paymentStatus", expression = "java(payment != null ? payment.getStatus() : null)")
    OrderDetailDto toDetailDto(Order order, Payment payment);
}
