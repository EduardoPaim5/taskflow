package com.nexilum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingResponse {

    private List<RankingEntry> rankings;
    private Integer totalParticipants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RankingEntry {
        private Integer position;
        private Long userId;
        private String userName;
        private String avatarUrl;
        private Integer level;
        private String levelName;
        private Integer totalPoints;
        private Integer tasksCompleted;
        private Integer currentStreak;
    }
}
