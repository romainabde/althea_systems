package com.althea.admin.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductUpdateRequest {

    private String name;
    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    private BigDecimal price;

    @Min(value = 0, message = "Le stock doit être supérieur ou égal à 0")
    private Integer stock;

    private Integer displayPriority;
    private Boolean active;
    private Integer categoryId;
}
