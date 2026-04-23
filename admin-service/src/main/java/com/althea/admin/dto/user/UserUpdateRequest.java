package com.althea.admin.dto.user;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    private String fullName;

    @Email(message = "Format d'email invalide")
    private String email;

    private String role;
    private String status;
    private Boolean locked;
    private Boolean isEmailConfirmed;
}
