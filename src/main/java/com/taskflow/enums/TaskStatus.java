package com.taskflow.enums;

public enum TaskStatus {
    TODO("A Fazer"),
    DOING("Em Progresso"),
    DONE("Concluído");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
