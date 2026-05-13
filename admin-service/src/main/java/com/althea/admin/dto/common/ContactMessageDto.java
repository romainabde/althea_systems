package com.althea.admin.dto.common;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageDto {
    private Integer id;
    private String fullName;
    private String email;
    private String subject;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private String responseMessage;
    private String respondedBy;
    private LocalDateTime respondedAt;
}
