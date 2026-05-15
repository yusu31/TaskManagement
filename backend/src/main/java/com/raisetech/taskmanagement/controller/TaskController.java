package com.raisetech.taskmanagement.controller;

import com.raisetech.taskmanagement.entity.Task;
import com.raisetech.taskmanagement.request.CreateTaskRequest;
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
}
