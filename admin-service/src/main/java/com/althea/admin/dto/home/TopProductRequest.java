package com.althea.admin.dto.home;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TopProductRequest {

    @NotNull(message = "productId est obligatoire")
    private Integer productId;

    private Integer displayOrder;

    private Boolean active = true;
}