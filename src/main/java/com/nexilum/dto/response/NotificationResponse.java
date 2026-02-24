package com.nexilum.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    public enum NotificationType {
        TASK_ASSIGNED,
        TASK_STATUS_CHANGED,
        TASK_COMMENT_ADDED,
        BADGE_EARNED,
        LEVEL_UP,
        PROJECT_MEMBER_ADDED,
        PROJECT_UPDATED
    }

    private NotificationType type;
    private String title;
    private String message;
    private Long entityId;
    private String entityType;
    private Long projectId;
    private String projectName;
    private Long actorId;
    private String actorName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // Factory methods for common notifications
    public static NotificationResponse taskAssigned(Long taskId, String taskTitle, Long projectId, String projectName, Long assignerId, String assignerName) {
        return NotificationResponse.builder()
                .type(NotificationType.TASK_ASSIGNED)
                .title("Nova tarefa atribuida")
                .message("Voce foi atribuido a tarefa: " + taskTitle)
                .entityId(taskId)
                .entityType("TASK")
                .projectId(projectId)
                .projectName(projectName)
                .actorId(assignerId)
                .actorName(assignerName)
                .build();
    }

    public static NotificationResponse taskStatusChanged(Long taskId, String taskTitle, String newStatus, Long projectId, String projectName, Long actorId, String actorName) {
        return NotificationResponse.builder()
                .type(NotificationType.TASK_STATUS_CHANGED)
                .title("Status da tarefa alterado")
                .message("A tarefa '" + taskTitle + "' foi movida para " + newStatus)
                .entityId(taskId)
                .entityType("TASK")
                .projectId(projectId)
                .projectName(projectName)
                .actorId(actorId)
                .actorName(actorName)
                .build();
    }

    public static NotificationResponse commentAdded(Long taskId, String taskTitle, Long commentId, Long projectId, String projectName, Long actorId, String actorName) {
        return NotificationResponse.builder()
                .type(NotificationType.TASK_COMMENT_ADDED)
                .title("Novo comentario")
                .message(actorName + " comentou na tarefa: " + taskTitle)
                .entityId(commentId)
                .entityType("COMMENT")
                .projectId(projectId)
                .projectName(projectName)
                .actorId(actorId)
                .actorName(actorName)
                .build();
    }

    public static NotificationResponse badgeEarned(Long badgeId, String badgeName, String badgeDescription) {
        return NotificationResponse.builder()
                .type(NotificationType.BADGE_EARNED)
                .title("Conquista desbloqueada!")
                .message("Voce ganhou a badge: " + badgeName + " - " + badgeDescription)
                .entityId(badgeId)
                .entityType("BADGE")
                .build();
    }

    public static NotificationResponse levelUp(int newLevel, String levelName, int totalPoints) {
        return NotificationResponse.builder()
                .type(NotificationType.LEVEL_UP)
                .title("Level Up!")
                .message("Parabens! Voce subiu para o nivel " + newLevel + " (" + levelName + ") com " + totalPoints + " pontos!")
                .entityId((long) newLevel)
                .entityType("LEVEL")
                .build();
    }

    public static NotificationResponse memberAdded(Long projectId, String projectName, Long addedById, String addedByName) {
        return NotificationResponse.builder()
                .type(NotificationType.PROJECT_MEMBER_ADDED)
                .title("Adicionado a projeto")
                .message("Voce foi adicionado ao projeto: " + projectName)
                .entityId(projectId)
                .entityType("PROJECT")
                .projectId(projectId)
                .projectName(projectName)
                .actorId(addedById)
                .actorName(addedByName)
                .build();
    }
}
