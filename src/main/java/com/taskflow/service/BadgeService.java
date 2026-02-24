package com.taskflow.service;

import com.taskflow.dto.response.BadgeResponse;
import com.taskflow.entity.ActivityLog;
import com.taskflow.entity.Badge;
import com.taskflow.entity.User;
import com.taskflow.entity.UserBadge;
import com.taskflow.enums.ActionType;
import com.taskflow.repository.ActivityLogRepository;
import com.taskflow.repository.BadgeRepository;
import com.taskflow.repository.CommentRepository;
import com.taskflow.repository.UserBadgeRepository;
import com.taskflow.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ActivityLogRepository activityLogRepository;
    
    // Injected via setter to avoid circular dependency
    private NotificationService notificationService;
    
    @org.springframework.beans.factory.annotation.Autowired
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Badge codes
    public static final String BADGE_FIRST_TASK = "FIRST_TASK";
    public static final String BADGE_ON_FIRE = "ON_FIRE";
    public static final String BADGE_SPRINTER = "SPRINTER";
    public static final String BADGE_COMMUNICATOR = "COMMUNICATOR";
    public static final String BADGE_LEADER = "LEADER";
    public static final String BADGE_CENTURION = "CENTURION";
    public static final String BADGE_EARLY_BIRD = "EARLY_BIRD";
    public static final String BADGE_TEAM_PLAYER = "TEAM_PLAYER";

    @PostConstruct
    public void initBadges() {
        createBadgeIfNotExists(BADGE_FIRST_TASK, "Primeira Tarefa", 
                "Complete sua primeira tarefa", "trophy", "TASKS_COMPLETED", 1);
        
        createBadgeIfNotExists(BADGE_ON_FIRE, "Em Chamas", 
                "Mantenha um streak de 7 dias", "fire", "STREAK_DAYS", 7);
        
        createBadgeIfNotExists(BADGE_SPRINTER, "Velocista", 
                "Complete 5 tarefas em um dia", "bolt", "TASKS_IN_DAY", 5);
        
        createBadgeIfNotExists(BADGE_COMMUNICATOR, "Comunicador", 
                "Faca 50 comentarios", "comment", "COMMENTS_MADE", 50);
        
        createBadgeIfNotExists(BADGE_LEADER, "Lider", 
                "Seja top 1 do ranking", "crown", "TOP_RANK", 1);
        
        createBadgeIfNotExists(BADGE_CENTURION, "Centuriao", 
                "Complete 100 tarefas", "medal", "TASKS_COMPLETED", 100);
        
        createBadgeIfNotExists(BADGE_EARLY_BIRD, "Madrugador", 
                "Complete 10 tarefas antes do deadline", "clock", "EARLY_COMPLETIONS", 10);
        
        createBadgeIfNotExists(BADGE_TEAM_PLAYER, "Jogador de Equipe", 
                "Participe de 5 projetos", "users", "PROJECTS_JOINED", 5);
    }

    private void createBadgeIfNotExists(String code, String name, String description, 
                                         String icon, String criteriaType, int requiredCount) {
        if (!badgeRepository.existsByCode(code)) {
            Badge badge = Badge.builder()
                    .code(code)
                    .name(name)
                    .description(description)
                    .icon(icon)
                    .criteriaType(criteriaType)
                    .requiredCount(requiredCount)
                    .build();
            badgeRepository.save(badge);
            log.info("Badge created: {}", code);
        }
    }

    public List<BadgeResponse> getUserBadges(Long userId) {
        return userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId)
                .stream()
                .map(BadgeResponse::fromUserBadge)
                .collect(Collectors.toList());
    }

    public List<BadgeResponse> getAllBadges() {
        return badgeRepository.findAll()
                .stream()
                .map(BadgeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public Optional<BadgeResponse> checkAndAwardBadges(User user) {
        BadgeResponse awardedBadge = null;

        // Check First Task badge
        if (user.getTasksCompleted() >= 1) {
            awardedBadge = awardBadgeIfNotEarned(user, BADGE_FIRST_TASK);
        }

        // Check Centurion badge
        if (user.getTasksCompleted() >= 100) {
            BadgeResponse badge = awardBadgeIfNotEarned(user, BADGE_CENTURION);
            if (badge != null) awardedBadge = badge;
        }

        // Check On Fire badge (7 day streak)
        if (user.getCurrentStreak() >= 7) {
            BadgeResponse badge = awardBadgeIfNotEarned(user, BADGE_ON_FIRE);
            if (badge != null) awardedBadge = badge;
        }

        // Check Communicator badge (50 comments)
        long commentCount = commentRepository.countByAuthorId(user.getId());
        if (commentCount >= 50) {
            BadgeResponse badge = awardBadgeIfNotEarned(user, BADGE_COMMUNICATOR);
            if (badge != null) awardedBadge = badge;
        }

        // Check Leader badge (top 1 in ranking)
        List<User> topUsers = userRepository.findAllByOrderByTotalPointsDesc();
        if (!topUsers.isEmpty() && topUsers.get(0).getId().equals(user.getId())) {
            BadgeResponse badge = awardBadgeIfNotEarned(user, BADGE_LEADER);
            if (badge != null) awardedBadge = badge;
        }

        return Optional.ofNullable(awardedBadge);
    }

    @Transactional
    public BadgeResponse awardBadgeIfNotEarned(User user, String badgeCode) {
        if (userBadgeRepository.userHasBadge(user.getId(), badgeCode)) {
            return null;
        }

        Optional<Badge> badgeOpt = badgeRepository.findByCode(badgeCode);
        if (badgeOpt.isEmpty()) {
            log.warn("Badge not found: {}", badgeCode);
            return null;
        }

        Badge badge = badgeOpt.get();
        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .build();
        userBadgeRepository.save(userBadge);

        // Log badge earned
        ActivityLog activityLog = ActivityLog.builder()
                .user(user)
                .action(ActionType.USER_BADGE_EARNED)
                .details("Badge conquistado: " + badge.getName())
                .build();
        activityLogRepository.save(activityLog);

        BadgeService.log.info("User {} earned badge: {}", user.getId(), badgeCode);

        // Send notification
        if (notificationService != null) {
            notificationService.notifyBadgeEarned(user, badge);
        }

        return BadgeResponse.fromUserBadge(userBadge);
    }

    public boolean userHasBadge(Long userId, String badgeCode) {
        return userBadgeRepository.userHasBadge(userId, badgeCode);
    }
}
