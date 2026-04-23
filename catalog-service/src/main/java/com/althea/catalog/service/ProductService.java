package com.althea.catalog.service;

import com.althea.catalog.dto.product.ProductAvailabilityDto;
import com.althea.catalog.dto.product.ProductSearchRequest;
import com.althea.catalog.dto.product.ProductWithImagesDto;
import com.althea.catalog.dto.product.SimilarProductsDto;
import com.althea.catalog.exception.ResourceNotFoundException;
import com.althea.catalog.mapper.ProductMapper;
import com.althea.shared.model.Category;
import com.althea.shared.model.Product;
import com.althea.shared.model.ProductImage;
import com.althea.catalog.repository.ProductImageRepository;
import com.althea.catalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final ProductMapper productMapper;


    private Sort buildSort(String sort) {

        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "newest" -> Sort.by("createdAt").descending();
            case "oldest" -> Sort.by("createdAt").ascending();
            case "availability" -> Sort.by("stock").descending();
            default -> Sort.by("createdAt").descending();
        };
    }

    // Rechercher des produits avec filtres/ tri
    public Page<ProductWithImagesDto> searchProducts(ProductSearchRequest request) {

        Specification<Product> spec = buildSpecification(request);

        Pageable pageable = PageRequest.of(
                Optional.ofNullable(request.getPage()).orElse(0),
                Optional.ofNullable(request.getSize()).orElse(20),
                buildSort(request.getSort())
        );

        // =========================
        // 1. PRODUCTS PAGE
        // =========================
        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<Product> products = productPage.getContent();

        if (products.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // =========================
        // 2. IMAGES (BATCH QUERY)
        // =========================
        List<Integer> productIds = products.stream()
                .map(Product::getId)
                .toList();

        List<ProductImage> images = imageRepository.findByProductIdIn(productIds);

        Map<Integer, List<ProductImage>> imagesByProductId = images.stream()
                .collect(Collectors.groupingBy(ProductImage::getProductId));

        // =========================
        // 3. MAPPING DTO
        // =========================
        List<ProductWithImagesDto> result = products.stream()
                .map(product -> new ProductWithImagesDto(
                        productMapper.toDto(product),
                        imagesByProductId.getOrDefault(product.getId(), List.of())
                ))
                .toList();

        // =========================
        // 4. RETURN PAGE
        // =========================
        return new PageImpl<>(
                result,
                pageable,
                productPage.getTotalElements()
        );
    }

    private Specification<Product> buildSpecification(ProductSearchRequest request) {

        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // TITLE
            if (request.getTitle() != null && !request.getTitle().isBlank()) {
                predicates.add(
                        cb.like(cb.lower(root.get("name")),
                                "%" + request.getTitle().toLowerCase() + "%")
                );
            }

            // DESCRIPTION
            if (request.getDescription() != null && !request.getDescription().isBlank()) {
                predicates.add(
                        cb.like(cb.lower(root.get("description")),
                                "%" + request.getDescription().toLowerCase() + "%")
                );
            }

            // PRICE
            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }

            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));
            }

            // AVAILABLE
            if (Boolean.TRUE.equals(request.getAvailable())) {
                predicates.add(cb.greaterThan(root.get("stock"), 0));
            }

            // CATEGORY
            if (request.getCategories() != null && !request.getCategories().isEmpty()) {

                Join<Product, Category> categoryJoin = root.join("category");

                predicates.add(
                        cb.lower(categoryJoin.get("name")).in(
                                request.getCategories().stream()
                                        .map(String::toLowerCase)
                                        .toList()
                        )
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Rechercher un produit et ses images
    public ProductWithImagesDto getProductWithImages(Integer productId) {
        Product product = getProductById(productId);
        List<ProductImage> images = imageRepository.findByProductId(productId);

        return new ProductWithImagesDto(productMapper.toDto(product), images);
    }

    // Rechercher si un produit est disponible
    public ProductAvailabilityDto checkAvailability(Integer productId) {
        Product product = getProductById(productId);

        if(product.getStock() == null || product.getStock() <= 0){
            return new ProductAvailabilityDto(false, 0);
        }

        return new ProductAvailabilityDto(true, product.getStock());
    }

    // Récupérer 6 produits similaires
    public SimilarProductsDto getSimilarProducts(Integer productId) {

        Product product = getProductById(productId);
        List<Product> allSimilarProducts = findProductsByCategoryId(product.getCategory().getId());

        // Séparer produits en stock
        List<Product> inStock = new ArrayList<>();
        List<Product> outOfStock = new ArrayList<>();

        for (Product p : allSimilarProducts) {
            if (p.getStock() != null && p.getStock() > 0) {
                inStock.add(p);
            } else {
                outOfStock.add(p);
            }
        }

        List<Product> finalList = new ArrayList<>(inStock);

        // Si moins de 6, compléter avec outOfStock
        int needed = 6 - finalList.size();
        if (needed > 0 && !outOfStock.isEmpty()) {
            // prendre les premiers needed éléments de outOfStock
            finalList.addAll(outOfStock.stream().limit(needed).toList());
        }

        // Si plus de 6, shuffle et prendre 6 au hasard
        if (finalList.size() > 6) {
            Collections.shuffle(finalList);
            finalList = finalList.subList(0, 6);
        }

        // Retourne la liste finale
        return new SimilarProductsDto(productId, productMapper.toDto(finalList));
    }


    // PROTECTED

    // Rechercher un produit par son id
    protected Product getProductById(Integer id){
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Le produit n'existe pas."));
    }

    // Rechercher tous les produits d'une catégorie
    protected List<Product> findProductsByCategoryId(Integer categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
}