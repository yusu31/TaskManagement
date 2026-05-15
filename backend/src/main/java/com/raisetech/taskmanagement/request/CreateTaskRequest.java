package com.raisetech.taskmanagement.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class CreateTaskRequest {

    // @NotBlank = 「空欄・空白だけはNG」というバリデーション（入力チェック）
    // @Size(max=255) = 255文字を超えてはいけない
    @NotBlank(message = "タイトルは必須です")
    @Size(max = 255, message = "タイトルは255文字以内で入力してください")
    private String title;

    // descriptionは任意入力なのでバリデーションなし
    private String description;

    // 優先度: HIGH / MEDIUM / LOW のいずれか
    private String priority;

    // ステータス: TODO / IN_PROGRESS / DONE のいずれか
    private String status;

    // 期日（任意）
    private LocalDate dueDate;

    // --- getter / setter ---
    // Javaのクラスではフィールドを private にして
    // getter/setter でアクセスするのが慣習（カプセル化）

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
}
