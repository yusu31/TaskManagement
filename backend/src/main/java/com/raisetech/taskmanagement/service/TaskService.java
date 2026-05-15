package com.raisetech.taskmanagement.service;

import com.raisetech.taskmanagement.entity.Task;
import com.raisetech.taskmanagement.repository.TaskRepository;
import com.raisetech.taskmanagement.request.CreateTaskRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)  // クラス全体は「読み取り専用」のトランザクション
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> searchTasks(String q, String status, String priority) {
        String normalizedQ = (q != null && !q.isBlank()) ? q : null;
        String normalizedStatus = (status != null && !status.isBlank()) ? status : null;
        String normalizedPriority = (priority != null && !priority.isBlank()) ? priority : null;
        return taskRepository.searchTasks(normalizedQ, normalizedStatus, normalizedPriority);
    }

    // @Transactional を個別につける = 「このメソッドはDBを書き換えるので書き込みOKのトランザクションにする」
    // クラス全体の readOnly=true を上書きしている
    @Transactional
    public Task createTask(CreateTaskRequest request) {
        // 1. 新しい Task エンティティ（DBのレコードになるオブジェクト）を作る
        Task task = new Task();

        // 2. リクエストの値を Task にコピーする
        //    フロントから届いたデータをDBに保存できる形に変換している
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());

        // 3. 優先度が未指定の場合はデフォルト値を設定する
        task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");

        // 4. ステータスが未指定の場合は「未着手（TODO）」をデフォルトにする
        task.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");

        task.setDueDate(request.getDueDate());

        // 5. repository.save() でDBに INSERT する
        //    JpaRepository が save() メソッドを持っているので自分で実装不要
        return taskRepository.save(task);
    }
}
