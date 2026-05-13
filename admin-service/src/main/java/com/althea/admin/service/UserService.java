package com.althea.admin.service;

import com.althea.admin.dto.common.UserAddressDto;
import com.althea.admin.dto.common.UserDto;
import com.althea.admin.dto.common.UserPurchaseDto;
import com.althea.admin.dto.user.UserUpdateRequest;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.UserMapper;
import com.althea.admin.repository.AddressRepository;
import com.althea.admin.repository.OrderRepository;
import com.althea.admin.repository.UserRepository;
import com.althea.shared.model.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Set<String> ALLOWED_ROLES = Set.of("CUSTOMER", "ADMIN", "SUPPORT");
    private static final Set<String> ALLOWED_STATUSES = Set.of("ACTIVE", "INACTIVE", "SUSPENDED");

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final UserMapper userMapper;

    public List<UserDto> findAll() {
        return userMapper.toDto(userRepository.findAll());
    }

    public UserDto findById(Integer id) {
        return userMapper.toDto(getUserById(id));
    }

    @Transactional
    public UserDto update(Integer id, UserUpdateRequest request) {
        User user = getUserById(id);

        if (request.getRole() != null && !ALLOWED_ROLES.contains(request.getRole().toUpperCase())) {
            throw new BadRequestException("Rôle invalide. Valeurs autorisées: CUSTOMER, ADMIN, SUPPORT.");
        }

        if (request.getStatus() != null && !ALLOWED_STATUSES.contains(request.getStatus().toUpperCase())) {
            throw new BadRequestException("Statut invalide. Valeurs autorisées: ACTIVE, INACTIVE, SUSPENDED.");
        }

        if (request.getRole() != null) {
            request.setRole(request.getRole().toUpperCase());
        }
        if (request.getStatus() != null) {
            request.setStatus(request.getStatus().toUpperCase());
        }

        userMapper.updateEntity(user, request);
        return userMapper.toDto(user);
    }

    @Transactional
    public void delete(Integer id) {
        User user = getUserById(id);

        boolean hasPurchases = !orderRepository.findByUser_IdOrderByCreatedAtDesc(id).isEmpty();
        if (hasPurchases) {
            throw new BadRequestException("Impossible de supprimer un utilisateur ayant un historique d'achats.");
        }

        userRepository.delete(user);
    }

    public List<UserPurchaseDto> findPurchases(Integer id) {
        getUserById(id);
        return userMapper.toPurchaseDto(orderRepository.findByUser_IdOrderByCreatedAtDesc(id));
    }

    public List<UserAddressDto> findAddresses(Integer id) {
        getUserById(id);
        return userMapper.toAddressDto(addressRepository.findByUser_Id(id));
    }

    private User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("L'utilisateur " + id + " n'existe pas"));
    }
}
