package com.taskflow.service;

import com.taskflow.dto.response.*;
import com.taskflow.entity.ActivityLog;
import com.taskflow.entity.User;
import com.taskflow.entity.UserBadge;
import com.taskflow.enums.ActionType;
import com.taskflow.enums.TaskPriority;
import com.taskflow.repository.ActivityLogRepository;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.UserBadgeRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ProjectRepository projectRepository;
    private final CommentRepository commentRepository;

    // Points configuration
    private static final int POINTS_TASK_CREATED = 5;
    private static final int POINTS_TASK_COMPLETED_LOW = 10;
    private static final int POINTS_TASK_COMPLETED_MEDIUM = 20;
    private static final int POINTS_TASK_COMPLETED_HIGH = 30;
    private static final int POINTS_COMMENT_ADDED = 2;
    private static final int POINTS_EARLY_COMPLETION_BONUS = 15;
    private static final int POINTS_STREAK_BONUS = 5;

    // Level thresholds
    private static final Map<Integer, LevelInfo> LEVELS = Map.of(
            1, new LevelInfo("Iniciante", 0, 99),
            2, new LevelInfo("Aprendiz", 100, 299),
            3, new LevelInfo("Colaborador", 300, 599),
            4, new LevelInfo("Especialista", 600, 999),
            5, new LevelInfo("Mestre", 1000, 1999),
            6, new LevelInfo("Lenda", 2000, Integer.MAX_VALUE)
    );

    public GamificationProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserBadge> recentBadges = userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId);
        Long totalBadges = userBadgeRepository.countByUserId(userId);
        
        int projectsCount = projectRepository.countByOwnerId(userId) + 
                           projectRepository.countByMembersId(userId);
        long commentsCount = commentRepository.countByAuthorId(userId);
        
        Integer globalRank = calculateGlobalRank(userId);
        
        LevelInfo currentLevel = LEVELS.get(user.getLevel());
        LevelInfo nextLevel = LEVELS.getOrDefault(user.getLevel() + 1, currentLevel);
        
        int pointsToNextLevel = nextLevel.minPoints - user.getTotalPoints();
        double progressPercentage = calculateProgressPercentage(user.getTotalPoints(), currentLevel, nextLevel);

        return GamificationProfileResponse.builder()
                .userId(user.getId())
                .userName(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .totalPoints(user.getTotalPoints())
                .level(user.getLevel())
                .levelName(user.getLevelName())
                .pointsToNextLevel(Math.max(0, pointsToNextLevel))
                .nextLevelThreshold(nextLevel.minPoints)
                .progressPercentage(progressPercentage)
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .tasksCompleted(user.getTasksCompleted())
                .projectsCount(projectsCount)
                .commentsCount((int) commentsCount)
                .recentBadges(recentBadges.stream()
                        .limit(5)
                        .map(BadgeResponse::fromUserBadge)
                        .collect(Collectors.toList()))
                .totalBadges(totalBadges.intValue())
                .globalRankPosition(globalRank)
                .build();
    }

    @Transactional
    public int awardPointsForTaskCreation(User user) {
        return awardPoints(user, POINTS_TASK_CREATED, ActionType.TASK_CREATED, "Tarefa criada");
    }

    @Transactional
    public int awardPointsForTaskCompletion(User user, TaskPriority priority, boolean beforeDeadline) {
        int points = switch (priority) {
            case LOW -> POINTS_TASK_COMPLETED_LOW;
            case MEDIUM -> POINTS_TASK_COMPLETED_MEDIUM;
            case HIGH -> POINTS_TASK_COMPLETED_HIGH;
        };

        if (beforeDeadline) {
            points += POINTS_EARLY_COMPLETION_BONUS;
        }

        user.setTasksCompleted(user.getTasksCompleted() + 1);
        
        return awardPoints(user, points, ActionType.TASK_COMPLETED, 
                "Tarefa completada (prioridade: " + priority + ")");
    }

    @Transactional
    public int awardPointsForComment(User user) {
        return awardPoints(user, POINTS_COMMENT_ADDED, ActionType.COMMENT_ADDED, "Comentario adicionado");
    }

    @Transactional
    public int awardPoints(User user, int points, ActionType action, String details) {
        user.addPoints(points);
        
        // Update streak
        updateStreak(user);
        
        // Check for level up
        checkAndUpdateLevel(user);
        
        // Log activity
        ActivityLog activityLog = ActivityLog.builder()
                .user(user)
                .action(action)
                .pointsEarned(points)
                .details(details)
                .build();
        activityLogRepository.save(activityLog);
        
        userRepository.save(user);
        
        log.info("Awarded {} points to user {} for action {}", points, user.getId(), action);
        
        return points;
    }

    private void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate();

        if (lastActivity == null) {
            user.setCurrentStreak(1);
        } else if (lastActivity.equals(today.minusDays(1))) {
            user.setCurrentStreak(user.getCurrentStreak() + 1);
            // Award streak bonus
            if (user.getCurrentStreak() > 1) {
                user.addPoints(POINTS_STREAK_BONUS);
            }
        } else if (!lastActivity.equals(today)) {
            user.setCurrentStreak(1);
        }

        if (user.getCurrentStreak() > user.getLongestStreak()) {
            user.setLongestStreak(user.getCurrentStreak());
        }

        user.setLastActivityDate(today);
    }

    private void checkAndUpdateLevel(User user) {
        int totalPoints = user.getTotalPoints();
        int currentLevel = user.getLevel();

        for (Map.Entry<Integer, LevelInfo> entry : LEVELS.entrySet()) {
            int level = entry.getKey();
            LevelInfo info = entry.getValue();

            if (totalPoints >= info.minPoints && totalPoints <= info.maxPoints) {
                if (level > currentLevel) {
                    user.setLevel(level);
                    user.setLevelName(info.name);
                    log.info("User {} leveled up to {} ({})", user.getId(), level, info.name);
                    
                    // Log level up
                    ActivityLog levelUpLog = ActivityLog.builder()
                            .user(user)
                            .action(ActionType.USER_LEVEL_UP)
                            .details("Subiu para o nivel " + level + " - " + info.name)
                            .build();
                    activityLogRepository.save(levelUpLog);
                }
                break;
            }
        }
    }

    /**
     * Verifica se o usuario subiu de nivel apos ganhar pontos
     */
    public boolean didUserLevelUp(User user, int previousLevel) {
        return user.getLevel() > previousLevel;
    }

    /**
     * Retorna o nome do nivel atual
     */
    public String getLevelName(int level) {
        LevelInfo info = LEVELS.get(level);
        return info != null ? info.name : "Desconhecido";
    }

    public RankingResponse getGlobalRanking(int limit) {
        List<User> topUsers = userRepository.findAllByOrderByTotalPointsDesc(PageRequest.of(0, limit));
        
        List<RankingResponse.RankingEntry> rankings = new ArrayList<>();
        int position = 1;
        
        for (User user : topUsers) {
            rankings.add(RankingResponse.RankingEntry.builder()
                    .position(position++)
                    .userId(user.getId())
                    .userName(user.getName())
                    .avatarUrl(user.getAvatarUrl())
                    .level(user.getLevel())
                    .levelName(user.getLevelName())
                    .totalPoints(user.getTotalPoints())
                    .tasksCompleted(user.getTasksCompleted())
                    .currentStreak(user.getCurrentStreak())
                    .build());
        }

        return RankingResponse.builder()
                .rankings(rankings)
                .totalParticipants((int) userRepository.count())
                .build();
    }

    public RankingResponse getProjectRanking(Long projectId, int limit) {
        List<User> projectMembers = userRepository.findByProjectIdOrderByTotalPointsDesc(projectId, PageRequest.of(0, limit));
        
        List<RankingResponse.RankingEntry> rankings = new ArrayList<>();
        int position = 1;
        
        for (User user : projectMembers) {
            rankings.add(RankingResponse.RankingEntry.builder()
                    .position(position++)
                    .userId(user.getId())
                    .userName(user.getName())
                    .avatarUrl(user.getAvatarUrl())
                    .level(user.getLevel())
                    .levelName(user.getLevelName())
                    .totalPoints(user.getTotalPoints())
                    .tasksCompleted(user.getTasksCompleted())
                    .currentStreak(user.getCurrentStreak())
                    .build());
        }

        return RankingResponse.builder()
                .rankings(rankings)
                .totalParticipants(projectMembers.size())
                .build();
    }

    public HeatmapResponse getActivityHeatmap(Long userId, int days) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> heatmapData = activityLogRepository.getActivityHeatmap(userId, startDate);

        Map<LocalDate, Integer> contributions = new LinkedHashMap<>();
        int totalActivities = 0;

        for (Object[] row : heatmapData) {
            LocalDate date = (LocalDate) row[0];
            Long count = (Long) row[1];
            contributions.put(date, count.intValue());
            totalActivities += count.intValue();
        }

        return HeatmapResponse.builder()
                .userId(userId)
                .userName(user.getName())
                .contributions(contributions)
                .totalActivities(totalActivities)
                .currentStreak(user.getCurrentStreak())
                .longestStreak(user.getLongestStreak())
                .build();
    }

    private Integer calculateGlobalRank(Long userId) {
        List<User> allUsers = userRepository.findAllByOrderByTotalPointsDesc();
        for (int i = 0; i < allUsers.size(); i++) {
            if (allUsers.get(i).getId().equals(userId)) {
                return i + 1;
            }
        }
        return null;
    }

    private double calculateProgressPercentage(int totalPoints, LevelInfo current, LevelInfo next) {
        if (current.equals(next)) {
            return 100.0; // Max level
        }
        int levelRange = next.minPoints - current.minPoints;
        int currentProgress = totalPoints - current.minPoints;
        return Math.min(100.0, (currentProgress * 100.0) / levelRange);
    }

    private record LevelInfo(String name, int minPoints, int maxPoints) {}
}
