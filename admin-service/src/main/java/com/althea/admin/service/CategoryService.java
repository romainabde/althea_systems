package com.althea.admin.service;

import com.althea.admin.dto.category.CategoryCreateRequest;
import com.althea.admin.dto.category.CategoryUpdateRequest;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.CategoryMapper;
import com.althea.admin.repository.CategoryRepository;
import com.althea.admin.repository.ProductRepository;
import com.althea.shared.model.Category;
import com.althea.shared.model.Product;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;
    private final ProductRepository productRepository;
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
    public void delete(Integer id) {
        Category existing = findById(id);
        repository.delete(existing);
    }
}