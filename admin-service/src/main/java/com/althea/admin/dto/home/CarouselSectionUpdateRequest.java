package com.althea.admin.dto.home;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CarouselSectionUpdateRequest {

    @Size(max = 255, message = "Le titre ne peut pas dépasser 255 caractères")
    private String title;

    private String text;

    @Size(max = 255, message = "L'URL de l'image ne peut pas dépasser 255 caractères")
    private String imageUrl;

    @Size(max = 255, message = "L'URL du lien ne peut pas dépasser 255 caractères")
    private String linkUrl;

    private Integer displayOrder;

    private Boolean active;
}