package com.nexilum.config;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;
    private final Environment environment;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefixo para mensagens que serao enviadas aos clientes (subscriptions)
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefixo para mensagens que chegam do cliente para o servidor
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefixo para mensagens destinadas a usuarios especificos
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] allowedOrigins = resolveAllowedOrigins();

        // Endpoint para conexao WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();
        
        // Endpoint sem SockJS fallback (para clientes nativos)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Adiciona interceptor de autenticacao JWT
        registration.interceptors(webSocketAuthInterceptor);
    }

    private String[] resolveAllowedOrigins() {
        String rawOrigins = environment.getProperty("CORS_ALLOWED_ORIGINS", "");
        List<String> origins = Arrays.stream(rawOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .collect(Collectors.toList());
        if (!origins.isEmpty()) {
            return origins.toArray(String[]::new);
        }
        if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
            return new String[]{"http://localhost:3000", "http://localhost:5173"};
        }
        return new String[0];
    }
}
