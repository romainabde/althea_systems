package com.althea.catalog.service;

import com.althea.catalog.dto.ProductAvailability;
import com.althea.catalog.dto.ProductWithImagesDto;
import com.althea.catalog.dto.SimilarProductsDto;
import com.althea.catalog.exception.ResourceNotFoundException;
import com.althea.catalog.mapper.ProductMapper;
import com.althea.catalog.model.Product;
import com.althea.catalog.model.ProductImage;
import com.althea.catalog.repository.ProductImageRepository;
import com.althea.catalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;
    private final ProductMapper productMapper;

    // Rechercher un produit et ses images
    public ProductWithImagesDto getProductWithImages(Integer productId) {
        Product product = getProductById(productId);
        List<ProductImage> images = imageRepository.findByProductId(productId);

        return new ProductWithImagesDto(productMapper.toDto(product), images);
    }

    // Rechercher si un produit est disponible
    public ProductAvailability checkAvailability(Integer productId) {
        Product product = getProductById(productId);

        if(product.getStock() == null || product.getStock() <= 0){
            return new ProductAvailability(false, 0);
        }

        return new ProductAvailability(true, product.getStock());
    }

    // Récupérer 6 produits similaires
    public SimilarProductsDto getSimilarProducts(Integer productId) {
        Product product = getProductById(productId);

        List<Product> similarProducts = findProductsByCategoryId(product.getCategory().getId());

        if(!similarProducts.isEmpty() && similarProducts.size() > 6){


        }
    }

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
            finalList.addAll(outOfStock.stream().limit(needed).collect(Collectors.toList()));
        }

        // Si plus de 6, shuffle et prendre 6 au hasard
        if (finalList.size() > 6) {
            Collections.shuffle(finalList);
            finalList = finalList.subList(0, 6);
        }

        // Retourne la liste finale
        return new SimilarProductsDto(productId, finalList);
    }


    // PROTECTED

    // Rechercher un produit par son id
    protected Product getProductById(Integer id){
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Le produit n'existe pas."));
    }

    // Rechercher tous les produits

    // Rechercher tous les produits par ordre de priorité (1 étant le plus fort)

    // Rechercher tous les produits d'une catégorie
    protected List<Product> findProductsByCategoryId(Integer categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    // Rechercher les produits disponibles


}