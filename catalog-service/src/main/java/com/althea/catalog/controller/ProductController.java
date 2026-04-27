package com.althea.catalog.controller;

import com.althea.catalog.dto.product.ProductSearchRequest;
import com.althea.catalog.service.ProductService;
import com.althea.catalog.util.ProductImagePayloadResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    /**
     * Fichier image binaire, consommable directement (balise &lt;img src="..."/&gt; avec l'URL du catalog).
     */
    @GetMapping("/{productId}/images/{imageId}/raw")
    public ResponseEntity<byte[]> getProductImageRaw(
            @PathVariable Integer productId,
            @PathVariable String imageId) {
        ProductImagePayloadResolver.Resolved payload = productService.getImagePayload(productId, imageId);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(payload.contentType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(payload.data());
    }
}