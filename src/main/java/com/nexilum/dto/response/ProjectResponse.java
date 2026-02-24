package com.nexilum.dto.response;

import com.nexilum.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private String icon;
    private String color;
    private UserSummary owner;
    private Integer memberCount;
    private Long taskCount;
    private Long completedTaskCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse fromEntity(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .icon(project.getIcon())
                .color(project.getColor())
                .owner(UserSummary.fromUser(project.getOwner()))
                .memberCount(project.getMembers().size())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public static ProjectResponse fromEntityWithStats(Project project, Long taskCount, Long completedTaskCount) {
        ProjectResponse response = fromEntity(project);
        response.setTaskCount(taskCount);
        response.setCompletedTaskCount(completedTaskCount);
        return response;
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
