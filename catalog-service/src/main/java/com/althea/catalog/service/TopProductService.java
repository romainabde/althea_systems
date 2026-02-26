package com.althea.catalog.service;

import com.althea.catalog.dto.product.ProductWithImagesDto;
import com.althea.catalog.model.TopProduct;
import com.althea.catalog.repository.TopProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TopProductService {

    private final TopProductRepository repository;
    private final ProductService productService;

    // PUBLIC

    // Récupérer tous les top produits actifs triés
    public List<ProductWithImagesDto> getTopProducts() {

        List<TopProduct> products = findActiveTopProducts();
        List<ProductWithImagesDto> finalProducts = new ArrayList<>();
        // Parcourir les produits mis en avant et ajouter les images
        for(TopProduct topProduct: products){
            // Ajouter les images au top produit
            finalProducts.add(productService.getProductWithImages(topProduct.getId()));
        }

        return finalProducts;
    }

    // PROTECTED
    protected List<TopProduct> findActiveTopProducts() {
        return repository.findByActiveTrueOrderByDisplayOrderAsc();
    }
}