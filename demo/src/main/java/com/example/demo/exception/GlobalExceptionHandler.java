package com.example.demo.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(
            ResponseStatusException exception) {
        HttpStatusCode status = exception.getStatusCode();
        HttpStatus httpStatus = HttpStatus.valueOf(status.value());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        String error = exception instanceof ApiException apiException
                ? apiException.getErrorCode()
                : httpStatus.getReasonPhrase();
        body.put("error", error);
        body.put("message", exception.getReason());

        return ResponseEntity.status(status).body(body);
    }
}
