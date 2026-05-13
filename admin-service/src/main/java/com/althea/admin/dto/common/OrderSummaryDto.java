package com.althea.admin.dto.common;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryDto {
    private Integer id;
    private Integer userId;
    private String userEmail;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private Integer itemCount;
}
