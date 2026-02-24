package com.nexilum.controller;

import com.nexilum.dto.response.NotificationResponse;
import com.nexilum.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {

    /**
     * Endpoint para o cliente confirmar que esta conectado.
     * Cliente envia mensagem para /app/connect
     * Servidor responde em /user/queue/connected
     */
    @MessageMapping("/connect")
    @SendToUser("/queue/connected")
    public NotificationResponse handleConnect(Principal principal) {
        log.info("WebSocket client connected: {}", principal != null ? principal.getName() : "anonymous");
        
        return NotificationResponse.builder()
                .type(NotificationResponse.NotificationType.PROJECT_UPDATED)
                .title("Conectado")
                .message("Conexao WebSocket estabelecida com sucesso")
                .build();
    }

    /**
     * Endpoint para o cliente se inscrever em notificacoes de um projeto.
     * Cliente envia mensagem para /app/subscribe/project com o projectId
     */
    @MessageMapping("/subscribe/project")
    @SendToUser("/queue/subscribed")
    public NotificationResponse subscribeToProject(@Payload Long projectId, Principal principal) {
        log.info("User {} subscribed to project {}", 
                principal != null ? principal.getName() : "anonymous", 
                projectId);
        
        return NotificationResponse.builder()
                .type(NotificationResponse.NotificationType.PROJECT_UPDATED)
                .title("Inscrito")
                .message("Inscrito no projeto " + projectId)
                .projectId(projectId)
                .build();
    }
}
