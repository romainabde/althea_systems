package com.althea.admin.controller;

import com.althea.admin.dto.product.ProductCreateRequest;
import com.althea.admin.dto.product.ProductImageCreateRequest;
import com.althea.admin.dto.product.ProductSearchRequest;
import com.althea.admin.dto.product.ProductStockUpdateRequest;
import com.althea.admin.dto.product.ProductUpdateRequest;
import com.althea.admin.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAll(@ModelAttribute ProductSearchRequest request) {
        return ResponseEntity.ok(productService.findAll(request));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "false") boolean confirm
    ) {
        productService.delete(id, confirm);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Integer id,
            @Valid @RequestBody ProductStockUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateStock(id, request));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<?> addImage(
            @PathVariable Integer id,
            @Valid @RequestBody ProductImageCreateRequest request
    ) {
        return ResponseEntity.ok(productService.addImage(id, request));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<?> deleteImage(
            @PathVariable Integer id,
            @PathVariable String imageId
    ) {
        return ResponseEntity.ok(productService.deleteImage(id, imageId));
    }
}
