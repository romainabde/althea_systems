package com.althea.admin.dto.order;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderSearchRequest {
    private Integer year;
    private String status;
    private Integer userId;
}
