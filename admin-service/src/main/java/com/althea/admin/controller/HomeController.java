package com.althea.admin.controller;

import com.althea.admin.dto.home.*;
import com.althea.admin.service.HomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/carousel")
    public ResponseEntity<?> getCarousel() {
        return ResponseEntity.ok(homeService.findCarousel());
    }

    @GetMapping("/homepage-text")
    public ResponseEntity<?> getHomepageText() {
        return ResponseEntity.ok(homeService.getHomepageText());
    }

    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts() {
        return ResponseEntity.ok(homeService.getTopProducts());
    }

    @GetMapping("/footer")
    public ResponseEntity<?> getFooter() {
        return ResponseEntity.ok(homeService.getFooter());
    }

    @PostMapping("/carousel/sections")
    public ResponseEntity<?> createCarouselSection(
            @Valid @RequestBody CarouselSectionCreateRequest request
    ) {
        return ResponseEntity.ok(
                homeService.createCarouselSection(request)
        );
    }

    @PutMapping("/top-products")
    public ResponseEntity<?> addTopProduct(
            @Valid @RequestBody TopProductRequest request
    ) {
        return ResponseEntity.ok(homeService.addTopProduct(request));
    }

    @PatchMapping("/carousel/{id}")
    public ResponseEntity<?> updateCarouselSection(
            @PathVariable Integer id,
            @Valid @RequestBody CarouselSectionUpdateRequest request
    ) {
        return ResponseEntity.ok(
                homeService.updateCarouselSection(id, request)
        );
    }

    @PatchMapping("/homepage-text")
    public ResponseEntity<?> updateHomepageText(
            @Valid @RequestBody HomepageTextUpdateRequest request
    ) {
        return ResponseEntity.ok(homeService.updateHomepageText(request));
    }

    @PatchMapping("/footer")
    public ResponseEntity<?> updateFooter(
            @Valid @RequestBody FooterUpdateRequest request
    ) {
        return ResponseEntity.ok(homeService.updateFooter(request));
    }

    @DeleteMapping("/carousel/{id}")
    public ResponseEntity<?> deleteCarouselSection(
            @PathVariable Integer id
    ) {
        homeService.deleteCarouselSection(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/top-products/{id}")
    public ResponseEntity<?> deleteTopProduct(@PathVariable Integer id) {
        homeService.removeTopProduct(id);
        return ResponseEntity.noContent().build();
    }
}
