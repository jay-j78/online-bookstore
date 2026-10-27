package com.bookstore.online_bookstore;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, Object>> handleValidationErrors(
                        MethodArgumentNotValidException ex) {

                Map<String, Object> response = new HashMap<>();

                String message = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .findFirst()
                                .map(error -> error.getDefaultMessage())
                                .orElse("Invalid request data");

                response.put("status", HttpStatus.BAD_REQUEST.value());
                response.put("message", message);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
        public ResponseEntity<Map<String, Object>> handleResponseStatusException(
                        org.springframework.web.server.ResponseStatusException ex) {

                Map<String, Object> response = new HashMap<>();

                response.put("status", ex.getStatusCode().value());
                response.put("message", ex.getReason());

                return ResponseEntity.status(ex.getStatusCode()).body(response);
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<Map<String, Object>> handleResourceNotFound(
                        NoResourceFoundException ex) {

                Map<String, Object> response = new HashMap<>();

                response.put("status", HttpStatus.NOT_FOUND.value());
                response.put("message", "Resource not found");

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(response);
        }
}
