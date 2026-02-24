package com.nexilum.service;

import com.nexilum.dto.response.UserResponse;
import com.nexilum.entity.User;
import com.nexilum.exception.ResourceNotFoundException;
import com.nexilum.repository.TaskRepository;
import com.nexilum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", id));

        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "email", email));

        return UserResponse.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(User user) {
        // Refresh user data from database
        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", user.getId()));

        return UserResponse.fromEntity(freshUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> findAllPaginated(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    public UserResponse updateProfile(User currentUser, String name, String avatarUrl) {
        log.debug("Updating profile for user {}", currentUser.getEmail());

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", currentUser.getId()));

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }

        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        User updated = userRepository.save(user);
        log.info("Profile updated for user {}", user.getEmail());

        return UserResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> searchByName(String query) {
        return userRepository.findByNameContainingIgnoreCase(query)
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getCompletedTasksCount(Long userId) {
        return taskRepository.countCompletedTasksByUser(userId);
    }
}
