package com.althea.catalog.dto.common;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

    private Integer id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer displayPriority;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Long categoryId;
    private String categoryName;
}