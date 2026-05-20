package com.althea.admin.service;

import com.althea.admin.dto.category.CategoryCreateRequest;
import com.althea.admin.dto.category.CategoryUpdateRequest;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.CategoryMapper;
import com.althea.admin.repository.CategoryRepository;
import com.althea.admin.repository.ProductImageRepository;
import com.althea.admin.repository.ProductRepository;
import com.althea.shared.model.Category;
import com.althea.shared.model.Product;
import com.althea.shared.model.ProductImage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryMapper mapper;

    public List<Category> findAll() {
        return repository.findAll();
    }

    public Category findById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La catégorie " + id + " n'existe pas"));
    }

    public List<Product> findProductsByCategory(Integer categoryId) {
        findById(categoryId);
        return productRepository.findByCategoryIdOrderByDisplayPriorityAsc(categoryId);
    }

    @Transactional
    public Category create(CategoryCreateRequest request) {
        Category category = mapper.toEntity(request);
        return repository.save(category);
    }

    @Transactional
    public Category update(Integer id, CategoryUpdateRequest request) {
        Category existing = findById(id);
        mapper.updateEntity(existing, request);
        return existing;
    }

    @Transactional
    public Category uploadImage(Integer id, MultipartFile file, String altText) {
        Category category = findById(id);

        deleteCategoryMongoImage(category);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fichier image vide ou manquant.");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }
        if (!contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BadRequestException("Le fichier doit être une image (Content-Type: image/*).");
        }

        final byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Impossible de lire le fichier image.");
        }
        if (data.length == 0) {
            throw new BadRequestException("Fichier image vide.");
        }

        ProductImage image = ProductImage.builder()
                .productId(null)
                .categoryId(id)
                .altText(altText != null ? altText.trim() : category.getName())
                .contentType(contentType.trim())
                .data(data)
                .build();

        ProductImage saved = productImageRepository.save(image);
        saved.setUrl("/images/" + saved.getId());
        productImageRepository.save(saved);

        category.setImageUrl(saved.getUrl());
        return repository.save(category);
    }

    @Transactional
    public Category deleteUploadedImage(Integer id) {
        Category category = findById(id);
        deleteCategoryMongoImage(category);
        category.setImageUrl(null);
        return repository.save(category);
    }

    private void deleteCategoryMongoImage(Category category) {
        String imageUrl = category.getImageUrl();
        if (imageUrl == null || !imageUrl.startsWith("/images/")) {
            return;
        }
        String mongoId = imageUrl.substring("/images/".length());
        if (mongoId.isBlank()) {
            return;
        }

        Optional<ProductImage> blob = productImageRepository.findByIdAndCategoryId(mongoId, category.getId())
                .or(() -> productImageRepository.findById(mongoId)
                        .filter(img -> img.getCategoryId() != null
                                && img.getCategoryId().equals(category.getId())));

        blob.ifPresent(productImageRepository::delete);
    }

    @Transactional
    public void delete(Integer id) {
        Category existing = findById(id);
        deleteCategoryMongoImage(existing);
        repository.delete(existing);
    }
}
