package com.althea.admin.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DailySalesDto {
    private LocalDate day;
    private Double totalSales;
}
