package com.nexilum.controller;

import com.nexilum.dto.response.*;
import com.nexilum.entity.User;
import com.nexilum.service.BadgeService;
import com.nexilum.service.GamificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gamification")
@RequiredArgsConstructor
@Tag(name = "Gamification", description = "Sistema de gamificacao - pontos, niveis, badges e ranking")
public class GamificationController {

    private final GamificationService gamificationService;
    private final BadgeService badgeService;

    @GetMapping("/profile")
    @Operation(summary = "Perfil de gamificacao", description = "Retorna o perfil completo de gamificacao do usuario autenticado")
    public ResponseEntity<ApiResponse<GamificationProfileResponse>> getMyProfile(
            @AuthenticationPrincipal User user) {
        GamificationProfileResponse profile = gamificationService.getProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile, "Perfil de gamificacao"));
    }

    @GetMapping("/profile/{userId}")
    @Operation(summary = "Perfil de outro usuario", description = "Retorna o perfil de gamificacao de um usuario especifico")
    public ResponseEntity<ApiResponse<GamificationProfileResponse>> getUserProfile(
            @PathVariable Long userId) {
        GamificationProfileResponse profile = gamificationService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Perfil de gamificacao"));
    }

    @GetMapping("/badges")
    @Operation(summary = "Meus badges", description = "Retorna todos os badges conquistados pelo usuario autenticado")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getMyBadges(
            @AuthenticationPrincipal User user) {
        List<BadgeResponse> badges = badgeService.getUserBadges(user.getId());
        return ResponseEntity.ok(ApiResponse.success(badges, "Badges do usuario"));
    }

    @GetMapping("/badges/{userId}")
    @Operation(summary = "Badges de usuario", description = "Retorna todos os badges de um usuario especifico")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getUserBadges(
            @PathVariable Long userId) {
        List<BadgeResponse> badges = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(badges, "Badges do usuario"));
    }

    @GetMapping("/badges/all")
    @Operation(summary = "Todos os badges", description = "Retorna todos os badges disponiveis no sistema")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getAllBadges() {
        List<BadgeResponse> badges = badgeService.getAllBadges();
        return ResponseEntity.ok(ApiResponse.success(badges, "Todos os badges"));
    }

    @GetMapping("/ranking")
    @Operation(summary = "Ranking global", description = "Retorna o ranking global de usuarios por pontos")
    public ResponseEntity<ApiResponse<RankingResponse>> getGlobalRanking(
            @RequestParam(defaultValue = "10") int limit) {
        RankingResponse ranking = gamificationService.getGlobalRanking(limit);
        return ResponseEntity.ok(ApiResponse.success(ranking, "Ranking global"));
    }

    @GetMapping("/ranking/project/{projectId}")
    @Operation(summary = "Ranking do projeto", description = "Retorna o ranking de usuarios dentro de um projeto especifico")
    public ResponseEntity<ApiResponse<RankingResponse>> getProjectRanking(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "10") int limit) {
        RankingResponse ranking = gamificationService.getProjectRanking(projectId, limit);
        return ResponseEntity.ok(ApiResponse.success(ranking, "Ranking do projeto"));
    }

    @GetMapping("/heatmap")
    @Operation(summary = "Meu heatmap", description = "Retorna o heatmap de atividades do usuario autenticado (estilo GitHub)")
    public ResponseEntity<ApiResponse<HeatmapResponse>> getMyHeatmap(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "365") int days) {
        HeatmapResponse heatmap = gamificationService.getActivityHeatmap(user.getId(), days);
        return ResponseEntity.ok(ApiResponse.success(heatmap, "Heatmap de atividades"));
    }

    @GetMapping("/heatmap/{userId}")
    @Operation(summary = "Heatmap de usuario", description = "Retorna o heatmap de atividades de um usuario especifico")
    public ResponseEntity<ApiResponse<HeatmapResponse>> getUserHeatmap(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "365") int days) {
        HeatmapResponse heatmap = gamificationService.getActivityHeatmap(userId, days);
        return ResponseEntity.ok(ApiResponse.success(heatmap, "Heatmap de atividades"));
    }
}
