package com.raisetech.taskmanagement.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

// UpdateTaskRequest = PUT /api/tasks/{id} で受け取るリクエストのデータ構造
// CreateTaskRequest とほぼ同じだが、「更新」専用として分けておくことで
// 将来バリデーションルールが変わっても影響を受けない
public class UpdateTaskRequest {

    // 更新時もタイトルは必須
    @NotBlank(message = "タイトルは必須です")
    @Size(max = 255, message = "タイトルは255文字以内で入力してください")
    private String title;

    private String description;

    private String priority;

    private String status;

    private LocalDate dueDate;

    private List<String> labels;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }
}
