package com.althea.admin.dto.product;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageCreateRequest {

    @NotBlank(message = "L'url de l'image est obligatoire")
    private String url;

    private String altText;
}
