package com.althea.catalog.controller;

import com.althea.catalog.service.ProductService;
import com.althea.catalog.util.ProductImagePayloadResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
public class ImageController {

    private final ProductService productService;

    @GetMapping("/{imageId}")
    public ResponseEntity<byte[]> getImageById(@PathVariable String imageId) {
        ProductImagePayloadResolver.Resolved payload = productService.getImagePayload(imageId);
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
