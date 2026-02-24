package com.nexilum.controller;

import com.nexilum.entity.User;
import com.nexilum.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Exportar relatorios de projetos em PDF e CSV")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/project/{projectId}/pdf")
    @Operation(summary = "Exportar relatorio do projeto em PDF")
    public ResponseEntity<byte[]> exportProjectPdf(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {

        byte[] pdfContent = reportService.generateProjectReportPdf(projectId, currentUser);

        String filename = generateFilename("projeto_" + projectId + "_relatorio", "pdf");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfContent.length)
                .body(pdfContent);
    }

    @GetMapping("/project/{projectId}/csv")
    @Operation(summary = "Exportar tarefas do projeto em CSV")
    public ResponseEntity<byte[]> exportProjectCsv(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {

        byte[] csvContent = reportService.generateProjectReportCsv(projectId, currentUser);

        String filename = generateFilename("projeto_" + projectId + "_tarefas", "csv");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(new MediaType("text", "csv"))
                .contentLength(csvContent.length)
                .body(csvContent);
    }

    private String generateFilename(String prefix, String extension) {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return prefix + "_" + date + "." + extension;
    }
}
