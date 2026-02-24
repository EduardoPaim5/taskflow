package com.nexilum.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s não encontrado com id: %d", resourceName, id));
    }

    public ResourceNotFoundException(String resourceName, String field, String value) {
        super(String.format("%s não encontrado com %s: %s", resourceName, field, value));
    }

    public ResourceNotFoundException(String resourceName, String field, Long value) {
        super(String.format("%s não encontrado com %s: %d", resourceName, field, value));
    }
}
