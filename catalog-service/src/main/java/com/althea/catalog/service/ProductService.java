package com.althea.catalog.service;

import com.althea.catalog.dto.product.ProductAvailabilityDto;
import com.althea.catalog.dto.product.ProductSearchRequest;
import com.althea.catalog.dto.product.ProductWithImagesDto;
import com.althea.catalog.dto.product.SimilarProductsDto;
import com.althea.catalog.exception.ResourceNotFoundException;
import com.althea.catalog.mapper.ProductMapper;
import com.althea.catalog.model.Product;
import com.althea.catalog.model.ProductImage;
import com.althea.catalog.repository.ProductImageRepository;
import com.althea.catalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final ProductMapper productMapper;

    // Rechercher des produits avec filtres/ tri
    public Page<Product> searchProducts(ProductSearchRequest request) {

        Specification<Product> spec = (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // =========================
            // 1. TITRE
            // =========================
            if (request.getTitle() != null && !request.getTitle().isBlank()) {
                String title = request.getTitle().toLowerCase();

                predicates.add(
                        cb.like(cb.lower(root.get("title")), "%" + title + "%")
                );
            }

            // =========================
            // 2. DESCRIPTION
            // =========================
            if (request.getDescription() != null && !request.getDescription().isBlank()) {
                String desc = request.getDescription().toLowerCase();

                predicates.add(
                        cb.like(cb.lower(root.get("description")), "%" + desc + "%")
                );
            }

            // =========================
            // 3. PRIX
            // =========================
            if (request.getMinPrice() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice())
                );
            }

            if (request.getMaxPrice() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice())
                );
            }

            // =========================
            // 4. DISPONIBILITÉ
            // =========================
            if (request.getAvailable() != null && request.getAvailable()) {
                predicates.add(
                        cb.greaterThan(root.get("stock"), 0)
                );
            }

            // =========================
            // 5. CATÉGORIES
            // =========================
            if (request.getCategories() != null && !request.getCategories().isEmpty()) {

                Join<Object, Object> categoryJoin = root.join("category");

                predicates.add(
                        categoryJoin.get("name").in(request.getCategories())
                );
            }

            // =========================
            // 6. SPECS
            // =========================
            if (request.getSpecs() != null && !request.getSpecs().isEmpty()) {

                // suppose relation: product -> attributes
                Join<Object, Object> attrJoin = root.join("attributes");

                List<Predicate> specPredicates = new ArrayList<>();

                request.getSpecs().forEach((key, value) -> {
                    specPredicates.add(
                            cb.and(
                                    cb.equal(attrJoin.get("name"), key),
                                    cb.equal(attrJoin.get("value"), value)
                            )
                    );
                });

                predicates.add(cb.and(specPredicates.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // =========================
        // SORT
        // =========================
        Sort sort = buildSort(request.getSort());

        Pageable pageable = PageRequest.of(
                Optional.ofNullable(request.getPage()).orElse(0),
                Optional.ofNullable(request.getSize()).orElse(20),
                sort
        );

        return productRepository.findAll(spec, pageable);

        /*

        Page<Product> products = cb.and(predicates.toArray(new Predicate[0]));
            List<ProductWithImagesDto> response = new ArrayList<>();
            for(Product product : products) {
                List<ProductImage> images = imageRepository.findByProductId(product.getId());
                response.add(new ProductWithImagesDto(productMapper.toDto(product), images));
            }

            return response;
         */
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

    // Trieur
    private Sort buildSort(String sortParam) {

        if (sortParam == null || sortParam.isBlank()) {
            return Sort.unsorted();
        }

        try {
            String[] parts = sortParam.split(",");
            String field = parts[0];
            String direction = parts.length > 1 ? parts[1] : "asc";

            Sort.Direction dir = direction.equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;

            return switch (field) {
                case "price", "createdAt", "stock" -> Sort.by(dir, field);
                default -> Sort.unsorted();
            };

        } catch (Exception e) {
            return Sort.unsorted();
        }
    }
}