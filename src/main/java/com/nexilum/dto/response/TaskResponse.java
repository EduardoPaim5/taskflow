package com.nexilum.dto.response;

import com.nexilum.entity.Task;
import com.nexilum.enums.TaskPriority;
import com.nexilum.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate deadline;
    private Boolean isOverdue;
    private LocalDateTime completedAt;
    private Integer pointsAwarded;
    
    private Long projectId;
    private String projectName;
    private UserSummary assignee;
    private UserSummary reporter;
    private Integer commentCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .deadline(task.getDeadline())
                .isOverdue(task.isOverdue())
                .completedAt(task.getCompletedAt())
                .pointsAwarded(task.getPointsAwarded())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignee(task.getAssignee() != null ? UserSummary.fromUser(task.getAssignee()) : null)
                .reporter(UserSummary.fromUser(task.getReporter()))
                .commentCount(task.getComments().size())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String name;
        private String avatarUrl;

        public static UserSummary fromUser(com.nexilum.entity.User user) {
            return UserSummary.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .avatarUrl(user.getAvatarUrl())
                    .build();
        }
    }
}
