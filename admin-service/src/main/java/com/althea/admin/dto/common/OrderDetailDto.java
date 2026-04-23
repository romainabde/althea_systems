package com.althea.admin.dto.common;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailDto {
    private Integer id;
    private Integer userId;
    private String userFullName;
    private String userEmail;
    private String guestEmail;
    private String sessionId;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;

    private Integer addressId;
    private String addressFirstName;
    private String addressLastName;
    private String addressStreet;
    private String addressCity;
    private String addressZipCode;
    private String addressCountry;
    private String addressPhone;

    private Integer paymentId;
    private String paymentStatus;

    private List<OrderItemDto> items;
}
