package com.althea.admin.dto.home;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CarouselSectionCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String title;

    @NotBlank(message = "Le texte est obligatoire")
    private String text;

    @NotBlank(message = "L'URL de l'image est obligatoire")
    @Size(max = 255, message = "L'URL de l'image ne peut pas dépasser 255 caractères")
    private String imageUrl;

    @NotBlank(message = "L'URL du lien est obligatoire")
    @Size(max = 255, message = "L'URL du lien ne peut pas dépasser 255 caractères")
    private String linkUrl;

    @NotNull(message = "L'ordre d'affichage est obligatoire")
    private Integer displayOrder;

    private Boolean active;
}