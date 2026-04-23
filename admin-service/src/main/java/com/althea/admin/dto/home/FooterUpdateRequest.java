package com.althea.admin.dto.home;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FooterUpdateRequest {

    @NotBlank(message = "Le contenu du footer est obligatoire")
    private String content;

    private Boolean active;
}