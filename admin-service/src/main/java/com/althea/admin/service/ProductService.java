package com.althea.admin.service;

import com.althea.admin.dto.product.*;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.ProductMapper;
import com.althea.admin.repository.CategoryRepository;
import com.althea.admin.repository.ProductImageRepository;
import com.althea.admin.repository.ProductRepository;
import com.althea.shared.dto.ProductImageView;
import com.althea.shared.model.Category;
import com.althea.shared.model.Product;
import com.althea.shared.model.ProductImage;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductMapper productMapper;

    public List<ProductWithImagesDto> findAll(ProductSearchRequest request) {
        Specification<Product> spec = buildSpecification(request);
        List<Product> products = productRepository.findAll(spec, buildSort(request.getSort()));
        return toWithImages(products);
    }

    public ProductWithImagesDto findById(Integer id) {
        Product product = getProductById(id);
        return toWithImages(product);
    }

    @Transactional
    public ProductWithImagesDto create(ProductCreateRequest request) {
        Product product = productMapper.toEntity(request);
        product.setCategory(getCategoryById(request.getCategoryId()));
        Product saved = productRepository.save(product);
        return toWithImages(saved);
    }

    @Transactional
    public ProductWithImagesDto update(Integer id, ProductUpdateRequest request) {
        Product existing = getProductById(id);
        productMapper.updateEntity(existing, request);

        if (request.getCategoryId() != null) {
            existing.setCategory(getCategoryById(request.getCategoryId()));
        }

        return toWithImages(existing);
    }

    @Transactional
    public void delete(Integer id, boolean confirm) {
        if (!confirm) {
            throw new BadRequestException("Suppression non confirmée. Utilisez confirm=true.");
        }

        Product existing = getProductById(id);
        productRepository.delete(existing);
    }

    @Transactional
    public ProductWithImagesDto updateStock(Integer id, ProductStockUpdateRequest request) {
        Product existing = getProductById(id);
        existing.setStock(request.getStock());
        return toWithImages(existing);
    }

    @Transactional
    public ProductWithImagesDto addImage(Integer id, ProductImageCreateRequest request) {
        Product existing = getProductById(id);

        String raw = firstNonBlank(request.getDataBase64(), request.getUrl());
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("Fournir dataBase64 (ou l'ancien champ url) et contentType.");
        }
        final byte[] data;
        try {
            data = decodeImagePayload(raw);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Image base64 invalide.");
        }
        if (data.length == 0) {
            throw new BadRequestException("Image vide.");
        }
        String contentType = request.getContentType() != null
                ? request.getContentType().trim()
                : "image/jpeg";

        ProductImage image = ProductImage.builder()
                .productId(existing.getId())
                .data(data)
                .contentType(contentType)
                .altText(request.getAltText())
                .url(null)
                .build();

        productImageRepository.save(image);
        return toWithImages(existing);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) {
            return a;
        }
        if (b != null && !b.isBlank()) {
            return b;
        }
        return null;
    }

    private static byte[] decodeImagePayload(String raw) {
        String s = raw.trim();
        if (s.startsWith("data:")) {
            int comma = s.indexOf(',');
            if (comma < 0) {
                throw new IllegalArgumentException("data-URL");
            }
            return Base64.getDecoder().decode(s.substring(comma + 1));
        }
        return Base64.getDecoder().decode(s);
    }

    @Transactional
    public ProductWithImagesDto deleteImage(Integer id, String imageId) {
        Product existing = getProductById(id);

        ProductImage image = productImageRepository.findByIdAndProductId(imageId, id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "L'image " + imageId + " n'existe pas pour le produit " + id
                ));

        productImageRepository.delete(image);
        return toWithImages(existing);
    }

    private Product getProductById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Le produit " + id + " n'existe pas"));
    }

    private Category getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("La catégorie " + categoryId + " n'existe pas"));
    }

    private List<ProductWithImagesDto> toWithImages(List<Product> products) {
        if (products.isEmpty()) {
            return List.of();
        }

        List<Integer> productIds = products.stream()
                .map(Product::getId)
                .toList();

        Map<Integer, List<ProductImage>> imagesByProductId = productImageRepository.findByProductIdIn(productIds)
                .stream()
                .collect(Collectors.groupingBy(ProductImage::getProductId));

        return products.stream()
                .map(product -> new ProductWithImagesDto(
                        productMapper.toDto(product),
                        toImageViews(imagesByProductId.getOrDefault(product.getId(), List.of()), product.getId())
                ))
                .toList();
    }

    private ProductWithImagesDto toWithImages(Product product) {
        return new ProductWithImagesDto(
                productMapper.toDto(product),
                toImageViews(productImageRepository.findByProductId(product.getId()), product.getId())
        );
    }

    private static List<ProductImageView> toImageViews(List<ProductImage> images, int productId) {
        if (images == null || images.isEmpty()) {
            return List.of();
        }
        return images.stream()
                .map(image -> ProductImageView.fromEntity(image, productId))
                .toList();
    }

    private Sort buildSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.ASC, "displayPriority");
        }

        return switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name_asc" -> Sort.by("name").ascending();
            case "name_desc" -> Sort.by("name").descending();
            case "stock_asc" -> Sort.by("stock").ascending();
            case "stock_desc" -> Sort.by("stock").descending();
            case "priority_desc" -> Sort.by("displayPriority").descending();
            case "newest" -> Sort.by("createdAt").descending();
            case "oldest" -> Sort.by("createdAt").ascending();
            default -> Sort.by("displayPriority").ascending();
        };
    }

    private Specification<Product> buildSpecification(ProductSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getIds() != null && !request.getIds().isEmpty()) {
                predicates.add(root.get("id").in(request.getIds()));
            }

            if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
                predicates.add(root.get("category").get("id").in(request.getCategoryIds()));
            }

            if (request.getActive() != null) {
                predicates.add(cb.equal(root.get("active"), request.getActive()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
