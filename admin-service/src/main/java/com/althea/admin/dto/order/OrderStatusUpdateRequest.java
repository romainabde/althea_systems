package com.althea.admin.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderStatusUpdateRequest {
    @NotBlank(message = "Le statut est obligatoire")
    private String status;
}
