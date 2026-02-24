package com.nexilum.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.nexilum.entity.Project;
import com.nexilum.entity.Task;
import com.nexilum.entity.User;
import com.nexilum.enums.TaskStatus;
import com.nexilum.exception.ForbiddenException;
import com.nexilum.exception.ResourceNotFoundException;
import com.nexilum.repository.ProjectRepository;
import com.nexilum.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Gera relatorio PDF do projeto
     */
    public byte[] generateProjectReportPdf(Long projectId, User currentUser) {
        Project project = getProjectAndValidateAccess(projectId, currentUser);
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        log.info("Generating PDF report for project {} by user {}", projectId, currentUser.getId());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Header
            addReportHeader(document, project);

            // Summary
            addProjectSummary(document, project, tasks);

            // Tasks table
            addTasksTable(document, tasks);

            // Footer
            addReportFooter(document);

            document.close();

            log.info("PDF report generated successfully for project {}", projectId);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error generating PDF report for project {}", projectId, e);
            throw new RuntimeException("Erro ao gerar relatorio PDF", e);
        }
    }

    /**
     * Gera relatorio CSV do projeto
     */
    public byte[] generateProjectReportCsv(Long projectId, User currentUser) {
        Project project = getProjectAndValidateAccess(projectId, currentUser);
        List<Task> tasks = taskRepository.findByProjectId(projectId);

        log.info("Generating CSV report for project {} by user {}", projectId, currentUser.getId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            // BOM for Excel UTF-8 compatibility
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            Writer writer = new OutputStreamWriter(baos, StandardCharsets.UTF_8);

            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader("ID", "Titulo", "Descricao", "Status", "Prioridade", 
                              "Responsavel", "Reporter", "Deadline", "Criado em", 
                              "Completado em", "Pontos")
                    .build();

            CSVPrinter printer = new CSVPrinter(writer, format);
            
            for (Task task : tasks) {
                printer.printRecord(
                        task.getId(),
                        task.getTitle(),
                        task.getDescription() != null ? task.getDescription() : "",
                        translateStatus(task.getStatus()),
                        translatePriority(task.getPriority().name()),
                        task.getAssignee() != null ? task.getAssignee().getName() : "Nao atribuido",
                        task.getReporter().getName(),
                        task.getDeadline() != null ? task.getDeadline().format(DATE_FORMATTER) : "",
                        task.getCreatedAt().format(DATETIME_FORMATTER),
                        task.getCompletedAt() != null ? task.getCompletedAt().format(DATETIME_FORMATTER) : "",
                        task.getPointsAwarded()
                );
            }
            
            printer.flush();
            writer.flush();
            
            log.info("CSV report generated successfully for project {}", projectId);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error generating CSV report for project {}", projectId, e);
            throw new RuntimeException("Erro ao gerar relatorio CSV", e);
        }
    }

    private Project getProjectAndValidateAccess(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto", "id", projectId));

        boolean hasAccess = project.getOwner().getId().equals(currentUser.getId()) ||
                project.getMembers().stream().anyMatch(m -> m.getId().equals(currentUser.getId()));

        if (!hasAccess) {
            throw new ForbiddenException("Voce nao tem acesso a este projeto");
        }

        return project;
    }

    private void addReportHeader(Document document, Project project) {
        Paragraph title = new Paragraph("Relatorio do Projeto: " + project.getName())
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(title);

        if (project.getDescription() != null && !project.getDescription().isEmpty()) {
            Paragraph desc = new Paragraph(project.getDescription())
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(desc);
        }

        Paragraph date = new Paragraph("Gerado em: " + LocalDateTime.now().format(DATETIME_FORMATTER))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginBottom(20);
        document.add(date);
    }

    private void addProjectSummary(Document document, Project project, List<Task> tasks) {
        Paragraph summaryTitle = new Paragraph("Resumo")
                .setFontSize(16)
                .setBold()
                .setMarginBottom(10);
        document.add(summaryTitle);

        Map<TaskStatus, Long> tasksByStatus = tasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));

        long todo = tasksByStatus.getOrDefault(TaskStatus.TODO, 0L);
        long doing = tasksByStatus.getOrDefault(TaskStatus.DOING, 0L);
        long done = tasksByStatus.getOrDefault(TaskStatus.DONE, 0L);
        long total = tasks.size();
        double completionRate = total > 0 ? (done * 100.0 / total) : 0;

        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(60))
                .setMarginBottom(20);

        addSummaryRow(summaryTable, "Total de tarefas:", String.valueOf(total));
        addSummaryRow(summaryTable, "A fazer:", String.valueOf(todo));
        addSummaryRow(summaryTable, "Em andamento:", String.valueOf(doing));
        addSummaryRow(summaryTable, "Concluidas:", String.valueOf(done));
        addSummaryRow(summaryTable, "Taxa de conclusao:", String.format("%.1f%%", completionRate));
        addSummaryRow(summaryTable, "Membros:", String.valueOf(project.getMembers().size()));
        addSummaryRow(summaryTable, "Proprietario:", project.getOwner().getName());

        document.add(summaryTable);
    }

    private void addSummaryRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold()).setBorder(null));
        table.addCell(new Cell().add(new Paragraph(value)).setBorder(null));
    }

    private void addTasksTable(Document document, List<Task> tasks) {
        Paragraph tasksTitle = new Paragraph("Tarefas")
                .setFontSize(16)
                .setBold()
                .setMarginTop(20)
                .setMarginBottom(10);
        document.add(tasksTitle);

        if (tasks.isEmpty()) {
            document.add(new Paragraph("Nenhuma tarefa cadastrada.").setItalic());
            return;
        }

        Table table = new Table(UnitValue.createPercentArray(new float[]{5, 25, 12, 12, 18, 13, 15}))
                .setWidth(UnitValue.createPercentValue(100));

        // Header
        DeviceRgb headerColor = new DeviceRgb(66, 133, 244);
        addTableHeader(table, "ID", headerColor);
        addTableHeader(table, "Titulo", headerColor);
        addTableHeader(table, "Status", headerColor);
        addTableHeader(table, "Prioridade", headerColor);
        addTableHeader(table, "Responsavel", headerColor);
        addTableHeader(table, "Deadline", headerColor);
        addTableHeader(table, "Criado em", headerColor);

        // Rows
        boolean alternate = false;
        for (Task task : tasks) {
            DeviceRgb bgColor = alternate ? new DeviceRgb(245, 245, 245) : new DeviceRgb(255, 255, 255);
            
            addTableCell(table, String.valueOf(task.getId()), bgColor);
            addTableCell(table, task.getTitle(), bgColor);
            addTableCell(table, translateStatus(task.getStatus()), bgColor, getStatusColor(task.getStatus()));
            addTableCell(table, translatePriority(task.getPriority().name()), bgColor);
            addTableCell(table, task.getAssignee() != null ? task.getAssignee().getName() : "-", bgColor);
            addTableCell(table, task.getDeadline() != null ? task.getDeadline().format(DATE_FORMATTER) : "-", bgColor);
            addTableCell(table, task.getCreatedAt().format(DATE_FORMATTER), bgColor);
            
            alternate = !alternate;
        }

        document.add(table);
    }

    private void addTableHeader(Table table, String text, DeviceRgb bgColor) {
        Cell cell = new Cell()
                .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(bgColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);
        table.addHeaderCell(cell);
    }

    private void addTableCell(Table table, String text, DeviceRgb bgColor) {
        addTableCell(table, text, bgColor, null);
    }

    private void addTableCell(Table table, String text, DeviceRgb bgColor, DeviceRgb textColor) {
        Paragraph p = new Paragraph(text != null ? text : "").setFontSize(9);
        if (textColor != null) {
            p.setFontColor(textColor);
        }
        Cell cell = new Cell()
                .add(p)
                .setBackgroundColor(bgColor)
                .setPadding(4);
        table.addCell(cell);
    }

    private void addReportFooter(Document document) {
        document.add(new Paragraph("\n"));
        Paragraph footer = new Paragraph("TaskFlow - Sistema de Gestao de Projetos")
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY);
        document.add(footer);
    }

    private String translateStatus(TaskStatus status) {
        return switch (status) {
            case TODO -> "A Fazer";
            case DOING -> "Em Andamento";
            case DONE -> "Concluido";
        };
    }

    private String translatePriority(String priority) {
        return switch (priority) {
            case "LOW" -> "Baixa";
            case "MEDIUM" -> "Media";
            case "HIGH" -> "Alta";
            default -> priority;
        };
    }

    private DeviceRgb getStatusColor(TaskStatus status) {
        return switch (status) {
            case TODO -> new DeviceRgb(158, 158, 158);
            case DOING -> new DeviceRgb(33, 150, 243);
            case DONE -> new DeviceRgb(76, 175, 80);
        };
    }
}
