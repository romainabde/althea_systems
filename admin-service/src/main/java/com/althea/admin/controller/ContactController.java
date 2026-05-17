package com.althea.admin.controller;

import com.althea.admin.dto.contact.ContactRespondRequest;
import com.althea.admin.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/contact/messages")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(contactService.findAllMessages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(contactService.findMessageById(id));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respond(
            @PathVariable Integer id,
            @Valid @RequestBody ContactRespondRequest request
    ) {
        return ResponseEntity.ok(contactService.respond(id, request));
    }
}
