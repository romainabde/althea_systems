package com.althea.admin.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductStockUpdateRequest {

    @NotNull(message = "Le stock est obligatoire")
    @Min(value = 0, message = "Le stock doit être supérieur ou égal à 0")
    private Integer stock;
}
