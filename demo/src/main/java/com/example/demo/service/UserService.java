package com.example.demo.service;

import com.example.demo.dto.response.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

        private final UserRepository userRepository;

        public UserService(UserRepository userRepository) {
                this.userRepository = userRepository;
        }

        public List<UserResponse> getAllUsers() {

                return userRepository.findAll()
                        .stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList());
        }

        public UserResponse getUserById(Long userId) {

                // Tìm user trong database
                User user = userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException("User not found with id: " + userId)
                        );
                return toResponse(user);
        }

        public UserResponse updateStatus(
                Long userId,
                boolean status,
                String currentAdminUsername
        ) {
                // Tìm user cần cập nhật
                User user = userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException("User not found with id: " + userId)
                        );

                //chặn admin tự tắt quyền
                if (user.getUsername().equalsIgnoreCase(currentAdminUsername)
                        && !status) {
                throw new ResponseStatusException(
                        BAD_REQUEST,
                        "Admin cannot deactivate own account"
                );
                }

                //true  -> Active
                // false -> Inactive
                user.setStatus(status);
                User savedUser = userRepository.save(user);
                return toResponse(savedUser);
        }

        private UserResponse toResponse(User user) {

                return new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getRole().name(),
                        user.isStatus()
                );
        }
}