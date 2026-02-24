package com.nexilum.service;

import com.nexilum.dto.response.NotificationResponse;
import com.nexilum.entity.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Envia notificacao para um usuario especifico usando email como identificador
     */
    public void sendToUser(User user, NotificationResponse notification) {
        String destination = "/queue/notifications";
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                destination,
                notification
        );
        log.debug("Notification sent to user {}: {}", user.getEmail(), notification.getType());
    }

    /**
     * Envia notificacao para todos os membros de um projeto
     */
    public void sendToProject(Project project, NotificationResponse notification) {
        // Envia para o owner
        sendToUser(project.getOwner(), notification);
        
        // Envia para todos os membros
        project.getMembers().forEach(member -> {
            if (!member.getId().equals(project.getOwner().getId())) {
                sendToUser(member, notification);
            }
        });
        
        log.debug("Notification sent to project {}: {}", project.getId(), notification.getType());
    }

    /**
     * Envia notificacao de tarefa atribuida
     */
    public void notifyTaskAssigned(Task task, User assigner) {
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(assigner.getId())) {
            NotificationResponse notification = NotificationResponse.taskAssigned(
                    task.getId(),
                    task.getTitle(),
                    task.getProject().getId(),
                    task.getProject().getName(),
                    assigner.getId(),
                    assigner.getName()
            );
            sendToUser(task.getAssignee(), notification);
        }
    }

    /**
     * Envia notificacao de mudanca de status da tarefa
     */
    public void notifyTaskStatusChanged(Task task, User actor) {
        NotificationResponse notification = NotificationResponse.taskStatusChanged(
                task.getId(),
                task.getTitle(),
                task.getStatus().name(),
                task.getProject().getId(),
                task.getProject().getName(),
                actor.getId(),
                actor.getName()
        );

        // Notifica o assignee se for diferente do actor
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(actor.getId())) {
            sendToUser(task.getAssignee(), notification);
        }

        // Notifica o reporter da tarefa se for diferente do actor e do assignee
        if (task.getReporter() != null && !task.getReporter().getId().equals(actor.getId()) 
                && (task.getAssignee() == null || !task.getReporter().getId().equals(task.getAssignee().getId()))) {
            sendToUser(task.getReporter(), notification);
        }
    }

    /**
     * Envia notificacao de novo comentario
     */
    public void notifyCommentAdded(Comment comment, User commenter) {
        Task task = comment.getTask();
        NotificationResponse notification = NotificationResponse.commentAdded(
                task.getId(),
                task.getTitle(),
                comment.getId(),
                task.getProject().getId(),
                task.getProject().getName(),
                commenter.getId(),
                commenter.getName()
        );

        // Notifica o assignee da tarefa
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(commenter.getId())) {
            sendToUser(task.getAssignee(), notification);
        }

        // Notifica o reporter da tarefa
        if (task.getReporter() != null && !task.getReporter().getId().equals(commenter.getId())
                && (task.getAssignee() == null || !task.getReporter().getId().equals(task.getAssignee().getId()))) {
            sendToUser(task.getReporter(), notification);
        }
    }

    /**
     * Envia notificacao de badge conquistada
     */
    public void notifyBadgeEarned(User user, Badge badge) {
        NotificationResponse notification = NotificationResponse.badgeEarned(
                badge.getId(),
                badge.getName(),
                badge.getDescription()
        );
        sendToUser(user, notification);
    }

    /**
     * Envia notificacao de level up
     */
    public void notifyLevelUp(User user, int newLevel, String levelName) {
        NotificationResponse notification = NotificationResponse.levelUp(
                newLevel,
                levelName,
                user.getTotalPoints()
        );
        sendToUser(user, notification);
    }

    /**
     * Envia notificacao de membro adicionado ao projeto
     */
    public void notifyMemberAdded(Project project, User addedMember, User addedBy) {
        NotificationResponse notification = NotificationResponse.memberAdded(
                project.getId(),
                project.getName(),
                addedBy.getId(),
                addedBy.getName()
        );
        sendToUser(addedMember, notification);
    }

    /**
     * Envia update em tempo real para canal do projeto (ex: kanban board)
     */
    public void broadcastToProjectChannel(Long projectId, String event, Object payload) {
        String destination = "/topic/project/" + projectId;
        messagingTemplate.convertAndSend(destination, new ProjectEvent(event, payload));
        log.debug("Broadcast to project {}: {}", projectId, event);
    }

    /**
     * Wrapper para eventos de projeto
     */
    public record ProjectEvent(String event, Object payload) {}
}
