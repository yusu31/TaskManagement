package com.raisetech.taskmanagement.controller;

import com.raisetech.taskmanagement.entity.Task;
import com.raisetech.taskmanagement.request.CreateTaskRequest;
import com.raisetech.taskmanagement.request.UpdateTaskRequest;
import com.raisetech.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Task>> searchTasks(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(taskService.searchTasks(q, status, priority));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // @PostMapping = POST メソッドのリクエストを受け付ける
    // POST /api/tasks に来たリクエストがこのメソッドに届く
    @PostMapping
    public ResponseEntity<Task> createTask(
            // @Valid = CreateTaskRequest に書いた @NotBlank などのバリデーションを実行する指示
            // @RequestBody = HTTPリクエストのボディ（JSON）を Java オブジェクトに変換する
            @Valid @RequestBody CreateTaskRequest request) {

        Task created = taskService.createTask(request);

        // 登録成功時は HTTP 201 Created を返すのが REST の慣習
        // Location ヘッダーに「新しいリソースのURL」を付けるのも慣習
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()          // 現在のURL（/api/tasks）を取得
                .path("/{id}")                 // /{id} を追加
                .buildAndExpand(created.getId()) // {id} に実際の ID を埋め込む
                .toUri();                      // → /api/tasks/14 のようなURIができる

        return ResponseEntity.created(location).body(created);
    }

    // @DeleteMapping("/{id}") = DELETE /api/tasks/{id} に来たリクエストがこのメソッドに届く
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        // deleteTask() が false を返した = IDが存在しなかった → 404 Not Found
        // deleteTask() が true を返した = 削除成功 → 204 No Content（ボディなし）
        if (!taskService.deleteTask(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    // @PutMapping("/{id}") = PUT /api/tasks/{id} に来たリクエストがこのメソッドに届く
    // {id} の部分は @PathVariable Long id で受け取る
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            // @PathVariable = URLの {id} 部分をここに受け取る
            @PathVariable Long id,
            // @Valid = UpdateTaskRequest のバリデーションを実行
            // @RequestBody = リクエストボディ（JSON）を UpdateTaskRequest に変換
            @Valid @RequestBody UpdateTaskRequest request) {

        // taskService.updateTask() は Optional<Task> を返す
        // .map(ResponseEntity::ok) = タスクが見つかった場合 → 200 OK + タスクを返す
        // .orElse(ResponseEntity.notFound().build()) = 見つからなかった場合 → 404 Not Found
        return taskService.updateTask(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
