package com.althea.catalog.service;

import com.althea.catalog.dto.common.CategoryDto;
import com.althea.catalog.dto.product.ProductWithImagesDto;
import com.althea.catalog.exception.ResourceNotFoundException;
import com.althea.catalog.mapper.CategoryMapper;
import com.althea.catalog.model.Category;
import com.althea.catalog.model.Product;
import com.althea.catalog.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ProductService productService;

    // Rechercher toutes les catégories
    public List<CategoryDto> findCategories() {
        List<Category> categories = findAllCategories();
        return categoryMapper.toDto(categories);
    }

    // Récupérer les données d'une catégorie via son id
    public CategoryDto getCategoryData(Integer categoryId) {
        Category category = getCategoryById(categoryId);
        return categoryMapper.toDto(category);
    }

    // Récupérer tous les produits d'une catégorie (+ image produit)
    public List<ProductWithImagesDto> findCategoryProducts(Integer categoryId) {

        // Vérifier que la catégorie existe
        getCategoryById(categoryId);
        // Récupérer tous les produits de cette catégorie
        List<Product> products = productService.findProductsByCategoryId(categoryId);
        List<ProductWithImagesDto> productWithImagesDto = new ArrayList<>();
        for(Product product : products){
            // Ajouter à la liste de l'objet <produit, images>
            productWithImagesDto.add(productService.getProductWithImages(product.getId()));
        }

        return productWithImagesDto;
    }


    // PROTECTED

    // Rechercher toutes les catégories
    protected List<Category> findAllCategories() {
        return categoryRepository.findAll();
    }

    // Rechercher une catégorie par son id
    protected Category getCategoryById(Integer id){
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La catégorie n'existe pas."));
    }


}