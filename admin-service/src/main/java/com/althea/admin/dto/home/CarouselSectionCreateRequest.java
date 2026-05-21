package com.althea.admin.dto.home;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CarouselSectionCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String title;

    @NotBlank(message = "Le texte est obligatoire")
    private String text;

    @Size(max = 255, message = "L'URL de l'image ne peut pas dépasser 255 caractères")
    private String imageUrl;

    /**
     * Obligatoire si {@code linkTargetType} est CUSTOM ou absent (défaut CUSTOM).
     * Optionnel pour CATEGORY / PRODUCT (lien dérivé côté catalogue si vide).
     */
    @Size(max = 255, message = "L'URL du lien ne peut pas dépasser 255 caractères")
    private String linkUrl;

    /**
     * CUSTOM (défaut) | CATEGORY | PRODUCT — voir {@link com.althea.shared.model.CarouselSection}.
     */
    @Pattern(regexp = "(?i)^(CUSTOM|CATEGORY|PRODUCT)$",
            message = "linkTargetType doit être CUSTOM, CATEGORY ou PRODUCT")
    private String linkTargetType;

    private Integer targetCategoryId;
    private Integer targetProductId;

    @NotNull(message = "L'ordre d'affichage est obligatoire")
    private Integer displayOrder;

    private Boolean active;
}
