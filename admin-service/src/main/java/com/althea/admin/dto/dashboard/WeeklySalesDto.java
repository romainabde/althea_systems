package com.althea.admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WeeklySalesDto {
    private String week;
    private Double totalSales;
}
