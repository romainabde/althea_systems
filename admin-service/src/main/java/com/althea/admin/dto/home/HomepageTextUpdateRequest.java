package com.althea.admin.dto.home;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HomepageTextUpdateRequest {

    @NotBlank(message = "Le contenu est obligatoire")
    private String content;

    private Boolean active;
}