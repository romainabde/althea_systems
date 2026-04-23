package com.althea.admin.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddressDto {
    private Integer id;
    private String firstName;
    private String lastName;
    private String street;
    private String city;
    private String zipCode;
    private String country;
    private String phone;
}
