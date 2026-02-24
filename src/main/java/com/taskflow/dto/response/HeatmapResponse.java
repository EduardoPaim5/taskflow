package com.taskflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapResponse {

    private Long userId;
    private String userName;
    private Map<LocalDate, Integer> contributions;
    private Integer totalActivities;
    private Integer currentStreak;
    private Integer longestStreak;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayActivity {
        private LocalDate date;
        private Integer count;
        private Integer level; // 0-4 for intensity (GitHub style)
    }
}
