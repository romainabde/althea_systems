package com.althea.admin.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductSearchRequest {
    private List<Integer> ids;
    private List<Integer> categoryIds;
    private Boolean active;
    private String sort;
}
