package com.althea.admin.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {
    private Integer productId;
    private String name;
    private Double price;
    private Integer quantity;
}
