package com.althea.admin.service;

import com.althea.admin.dto.dashboard.AverageBasketByCategoryDto;
import com.althea.admin.dto.dashboard.CategorySalesDto;
import com.althea.admin.dto.dashboard.DailySalesDto;
import com.althea.admin.dto.dashboard.WeeklySalesDto;
import com.althea.admin.repository.OrderRepository;
import com.althea.admin.repository.ProductRepository;
import com.althea.shared.model.Order;
import com.althea.shared.model.OrderItem;
import com.althea.shared.model.Product;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public List<DailySalesDto> getDailySales(LocalDate startDate, LocalDate endDate) {
        DateRange range = resolveRange(startDate, endDate, 30);
        List<Order> orders = getOrders(range);

        Map<LocalDate, Double> totals = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getCreatedAt().toLocalDate(),
                        TreeMap::new,
                        Collectors.summingDouble(Order::getTotalAmount)
                ));

        return totals.entrySet().stream()
                .map(entry -> new DailySalesDto(entry.getKey(), entry.getValue()))
                .toList();
    }

    @Transactional
    public List<WeeklySalesDto> getWeeklySales(LocalDate startDate, LocalDate endDate) {
        DateRange range = resolveRange(startDate, endDate, 90);
        List<Order> orders = getOrders(range);
        WeekFields weekFields = WeekFields.ISO;

        Map<String, Double> totals = new TreeMap<>();
        for (Order order : orders) {
            LocalDate date = order.getCreatedAt().toLocalDate();
            int week = date.get(weekFields.weekOfWeekBasedYear());
            int year = date.get(weekFields.weekBasedYear());
            String key = String.format("%d-W%02d", year, week);
            totals.merge(key, order.getTotalAmount(), Double::sum);
        }

        return totals.entrySet().stream()
                .map(entry -> new WeeklySalesDto(entry.getKey(), entry.getValue()))
                .toList();
    }

    @Transactional
    public List<AverageBasketByCategoryDto> getAverageBasketByCategory(LocalDate startDate, LocalDate endDate) {
        DateRange range = resolveRange(startDate, endDate, 90);
        List<Order> orders = getOrders(range);
        Map<Integer, CategoryInfo> productCategoryLookup = buildProductCategoryLookup(orders);

        Map<Integer, Double> categoryAmountSum = new HashMap<>();
        Map<Integer, Integer> categoryOrderCount = new HashMap<>();
        Map<Integer, String> categoryNames = new HashMap<>();

        for (Order order : orders) {
            Map<Integer, Double> categoryAmountForOrder = new HashMap<>();

            for (OrderItem item : order.getItems()) {
                CategoryInfo info = productCategoryLookup.get(item.getProductId());
                if (info == null) {
                    continue;
                }

                double lineTotal = item.getPrice() * item.getQuantity();
                categoryAmountForOrder.merge(info.categoryId(), lineTotal, Double::sum);
                categoryNames.put(info.categoryId(), info.categoryName());
            }

            for (Map.Entry<Integer, Double> entry : categoryAmountForOrder.entrySet()) {
                categoryAmountSum.merge(entry.getKey(), entry.getValue(), Double::sum);
                categoryOrderCount.merge(entry.getKey(), 1, Integer::sum);
            }
        }

        return categoryAmountSum.entrySet().stream()
                .map(entry -> {
                    Integer categoryId = entry.getKey();
                    double avg = entry.getValue() / categoryOrderCount.get(categoryId);
                    return new AverageBasketByCategoryDto(
                            categoryId,
                            categoryNames.getOrDefault(categoryId, "Unknown"),
                            avg
                    );
                })
                .sorted(Comparator.comparing(AverageBasketByCategoryDto::getAverageBasket).reversed())
                .toList();
    }

    @Transactional
    public List<CategorySalesDto> getCategorySales(LocalDate startDate, LocalDate endDate) {
        DateRange range = resolveRange(startDate, endDate, 90);
        List<Order> orders = getOrders(range);
        Map<Integer, CategoryInfo> productCategoryLookup = buildProductCategoryLookup(orders);

        Map<Integer, Double> salesByCategory = new HashMap<>();
        Map<Integer, String> categoryNames = new HashMap<>();

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                CategoryInfo info = productCategoryLookup.get(item.getProductId());
                if (info == null) {
                    continue;
                }

                double lineTotal = item.getPrice() * item.getQuantity();
                salesByCategory.merge(info.categoryId(), lineTotal, Double::sum);
                categoryNames.put(info.categoryId(), info.categoryName());
            }
        }

        double grandTotal = salesByCategory.values().stream().mapToDouble(Double::doubleValue).sum();
        if (grandTotal == 0.0) {
            return List.of();
        }

        return salesByCategory.entrySet().stream()
                .map(entry -> {
                    Integer categoryId = entry.getKey();
                    Double sales = entry.getValue();
                    Double percentage = (sales / grandTotal) * 100.0;
                    return new CategorySalesDto(
                            categoryId,
                            categoryNames.getOrDefault(categoryId, "Unknown"),
                            sales,
                            percentage
                    );
                })
                .sorted(Comparator.comparing(CategorySalesDto::getSales).reversed())
                .toList();
    }

    private List<Order> getOrders(DateRange range) {
        return orderRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(range.start(), range.endExclusive());
    }

    private DateRange resolveRange(LocalDate startDate, LocalDate endDate, int defaultDaysBack) {
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        LocalDate start = startDate != null ? startDate : end.minusDays(defaultDaysBack);

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTimeExclusive = end.plusDays(1).atStartOfDay();

        return new DateRange(startDateTime, endDateTimeExclusive);
    }

    private Map<Integer, CategoryInfo> buildProductCategoryLookup(List<Order> orders) {
        Set<Integer> productIds = orders.stream()
                .flatMap(order -> order.getItems().stream())
                .map(OrderItem::getProductId)
                .collect(Collectors.toSet());

        if (productIds.isEmpty()) {
            return Map.of();
        }

        return productRepository.findAllById(productIds).stream()
                .filter(product -> product.getCategory() != null)
                .collect(Collectors.toMap(
                        Product::getId,
                        product -> new CategoryInfo(product.getCategory().getId(), product.getCategory().getName())
                ));
    }

    private record DateRange(LocalDateTime start, LocalDateTime endExclusive) {}

    private record CategoryInfo(Integer categoryId, String categoryName) {}
}
