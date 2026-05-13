package com.althea.admin.dto.common;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Integer id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;
    private Boolean isEmailConfirmed;
    private String role;
    private String status;
    private Boolean locked;
}
