package com.althea.admin.service;

import com.althea.admin.dto.common.ContactMessageDto;
import com.althea.admin.dto.contact.ContactRespondRequest;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.ContactMessageMapper;
import com.althea.admin.repository.ContactMessageRepository;
import com.althea.shared.model.ContactMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final ContactMessageMapper contactMessageMapper;

    public List<ContactMessageDto> findAllMessages() {
        return contactMessageMapper.toDto(
                contactMessageRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
    }

    public ContactMessageDto findMessageById(Integer id) {
        return contactMessageMapper.toDto(getById(id));
    }

    @Transactional
    public ContactMessageDto respond(Integer id, ContactRespondRequest request) {
        ContactMessage message = getById(id);

        if ("RESPONDED".equalsIgnoreCase(message.getStatus())) {
            throw new BadRequestException("Ce message a déjà reçu une réponse.");
        }

        message.setResponseMessage(request.getResponseMessage());
        message.setRespondedBy(request.getRespondedBy());
        message.setRespondedAt(LocalDateTime.now());
        message.setStatus("RESPONDED");

        return contactMessageMapper.toDto(message);
    }

    private ContactMessage getById(Integer id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Le message de contact " + id + " n'existe pas"));
    }
}
