package com.althea.admin.controller;

import com.althea.admin.dto.user.UserUpdateRequest;
import com.althea.admin.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/purchases")
    public ResponseEntity<?> getPurchases(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.findPurchases(id));
    }

    @GetMapping("/{id}/addresses")
    public ResponseEntity<?> getAddresses(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.findAddresses(id));
    }
}
