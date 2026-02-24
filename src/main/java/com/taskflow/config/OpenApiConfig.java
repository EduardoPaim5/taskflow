package com.taskflow.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
            .info(new Info()
                .title("TaskFlow API")
                .description("""
                    API REST para o sistema TaskFlow - Gestão de Projetos com Gamificação.
                    
                    ## Features
                    - Autenticação JWT
                    - Gestão de Projetos e Tarefas
                    - Sistema de Gamificação (pontos, níveis, badges)
                    - Ranking de usuários
                    - Colaboração em tempo real (WebSocket)
                    - Relatórios exportáveis (PDF/CSV)
                    
                    ## Autenticação
                    Use o endpoint `/auth/login` para obter um token JWT.
                    Inclua o token no header `Authorization: Bearer <token>` para acessar endpoints protegidos.
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("Seu Nome")
                    .email("seu.email@example.com")
                    .url("https://github.com/seuuser/taskflow"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server().url("http://localhost:" + serverPort + "/api").description("Development Server"),
                new Server().url("https://taskflow-api.onrender.com/api").description("Production Server")
            ))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Insira o token JWT obtido no login")));
    }
}
