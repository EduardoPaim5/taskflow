package com.nexilum.enums;

public enum TaskPriority {
    LOW(10, "Baixa"),
    MEDIUM(20, "Média"),
    HIGH(30, "Alta");

    private final int points;
    private final String displayName;

    TaskPriority(int points, String displayName) {
        this.points = points;
        this.displayName = displayName;
    }

    public int getPoints() {
        return points;
    }

    public String getDisplayName() {
        return displayName;
    }
}
