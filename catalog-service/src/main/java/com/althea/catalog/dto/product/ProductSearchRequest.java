package com.althea.catalog.dto.product;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProductSearchRequest {

    // Texte
    private String title;
    private String description;

    // Prix
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Catégories
    private List<String> categories;

    // Disponibilité
    private Boolean available;

    // Caractéristiques dynamiques
    private Map<String, String> specs;

    // Tri
    private String sort;

    // Pagination
    private Integer page = 0;
    private Integer size = 20;
}