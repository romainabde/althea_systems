package com.althea.admin.dto.category;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryUpdateRequest {

    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String name;

    private String description;

    private String imageUrl;

    private Integer displayOrder;

    private Boolean active;
}
