package com.althea.catalog.controller;

import com.althea.catalog.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/")
    public ResponseEntity<?> findCategories() {
        return ResponseEntity.ok(categoryService.findCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryData(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.getCategoryData(id));
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<?> findCategoryProducts(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.findCategoryProducts(id));
    }
}