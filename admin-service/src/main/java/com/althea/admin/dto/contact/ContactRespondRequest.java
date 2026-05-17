package com.althea.admin.dto.contact;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRespondRequest {
    @NotBlank(message = "La réponse est obligatoire")
    private String responseMessage;

    @NotBlank(message = "Le nom de l'agent est obligatoire")
    private String respondedBy;
}
