package com.althea.admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AverageBasketByCategoryDto {
    private Integer categoryId;
    private String categoryName;
    private Double averageBasket;
}
