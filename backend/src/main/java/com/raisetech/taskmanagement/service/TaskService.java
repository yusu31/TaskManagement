package com.raisetech.taskmanagement.service;

import com.raisetech.taskmanagement.entity.Task;
import com.raisetech.taskmanagement.repository.TaskRepository;
import com.raisetech.taskmanagement.request.CreateTaskRequest;
import com.raisetech.taskmanagement.request.UpdateTaskRequest;
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

        // ラベル（複数選択可）を設定する。nullの場合は空リストにして「ラベルなし」にする
        task.setLabels(request.getLabels() != null ? request.getLabels() : new java.util.ArrayList<>());

        // 5. repository.save() でDBに INSERT する
        //    JpaRepository が save() メソッドを持っているので自分で実装不要
        return taskRepository.save(task);
    }

    // deleteTask = DELETE /api/tasks/{id} に対応するメソッド
    // 戻り値が boolean な理由: 削除できた(true) / IDが存在しなかった(false) をControllerに伝えるため
    @Transactional
    public boolean deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            return false;
        }
        taskRepository.deleteById(id);
        return true;
    }

    // updateTask = PUT /api/tasks/{id} に対応するメソッド
    // Optional<Task> を返す理由: 指定した id のタスクが存在しない場合は
    // 「空」を返して Controller 側で 404 にするため
    @Transactional
    public Optional<Task> updateTask(Long id, UpdateTaskRequest request) {
        // findById(id) で DB を検索し、見つかったら .map() の中の処理を実行する
        // 見つからなければ Optional.empty() が返り、.map() はスキップされる
        return taskRepository.findById(id).map(task -> {
            // 既存タスクの各フィールドをリクエストの値で上書きする
            task.setTitle(request.getTitle());

            // description は null でもOK（nullを保存すると「説明なし」に戻る）
            task.setDescription(request.getDescription());

            // priority が未指定（null）の場合は "MEDIUM" をデフォルトにする
            task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");

            // status が未指定（null）の場合は "TODO" をデフォルトにする
            task.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");

            // dueDate は null でもOK（nullを保存すると「期日なし」に戻る）
            task.setDueDate(request.getDueDate());

            // ラベルを更新する。nullの場合は空リストで上書きして「ラベルなし」にする
            task.setLabels(request.getLabels() != null ? request.getLabels() : new java.util.ArrayList<>());

            // save() を呼ぶと JPA が UPDATE 文を発行してDBを更新する
            // Task entity の @PreUpdate が自動的に updatedAt を現在時刻に更新する
            return taskRepository.save(task);
        });
    }
}
