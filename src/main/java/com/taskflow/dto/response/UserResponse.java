package com.taskflow.dto.response;

import com.taskflow.entity.User;
import com.taskflow.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private Role role;
    
    // Gamification
    private Integer totalPoints;
    private Integer level;
    private String levelName;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer tasksCompleted;
    private Long badgeCount;
    
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .totalPoints(user.getTotalPoints())
                .level(user.getLevel())
                .levelName(user.getLevelName())
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .tasksCompleted(user.getTasksCompleted())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserResponse fromEntityWithBadgeCount(User user, Long badgeCount) {
        UserResponse response = fromEntity(user);
        response.setBadgeCount(badgeCount);
        return response;
    }
}
