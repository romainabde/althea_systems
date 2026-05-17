package com.althea.catalog.controller;

import com.althea.catalog.dto.product.ProductSearchRequest;
import com.althea.catalog.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping()
    public ResponseEntity<?> searchProducts(@ModelAttribute ProductSearchRequest request) {
        return ResponseEntity.ok(productService.searchProducts(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductWithImages(id));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<?> getAvailability(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.checkAvailability(id));
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<?> getSimilarProducts(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getSimilarProducts(id));
    }
}