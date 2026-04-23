package com.althea.admin.dto.common;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPurchaseDto {
    private Integer orderId;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private Integer itemCount;
}
