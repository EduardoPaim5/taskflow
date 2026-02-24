package com.taskflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamificationProfileResponse {

    private Long userId;
    private String userName;
    private String avatarUrl;
    
    // Points and Level
    private Integer totalPoints;
    private Integer level;
    private String levelName;
    private Integer pointsToNextLevel;
    private Integer nextLevelThreshold;
    private Double progressPercentage;
    
    // Streaks
    private Integer currentStreak;
    private Integer longestStreak;
    
    // Stats
    private Integer tasksCompleted;
    private Integer projectsCount;
    private Integer commentsCount;
    
    // Badges
    private List<BadgeResponse> recentBadges;
    private Integer totalBadges;
    
    // Ranking
    private Integer globalRankPosition;
}
