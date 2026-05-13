package com.althea.admin.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryCreateRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String name;

    private String description;

    private String imageUrl;

    @NotNull(message = "L'ordre d'affichage est obligatoire")
    private Integer displayOrder;

    private Boolean active = true;
}