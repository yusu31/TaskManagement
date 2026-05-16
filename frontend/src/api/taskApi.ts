import type { Task, SearchParams, CreateTaskInput, UpdateTaskInput } from '../types/task';

export async function fetchTasks(params: SearchParams = {}): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params.q)        query.set('q', params.q);
  if (params.status)   query.set('status', params.status);
  if (params.priority) query.set('priority', params.priority);

  const hasParams = [...query.keys()].length > 0;
  const url = hasParams ? `/api/tasks/search?${query}` : '/api/tasks';

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// POST /api/tasks にリクエストを送り、作成されたタスクを返す関数
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch('/api/tasks', {
    method: 'POST',              // GETではなくPOSTで送る
    headers: {
      'Content-Type': 'application/json',  // 「ボディの中身はJSONです」とサーバーに伝える
    },
    body: JSON.stringify(input), // JavaScriptオブジェクト → JSON文字列に変換して送る
  });

  // 201 Created 以外はエラーとして扱う
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  // サーバーから返ってきたJSONを Task 型のオブジェクトに変換して返す
  return res.json();
}

// DELETE /api/tasks/{id} にリクエストを送る関数
// 削除成功時は 204 No Content が返るのでボディは読まない（戻り値は void）
export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

  // 204 以外はエラーとして扱う（404 = 存在しないタスク など）
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}

// PUT /api/tasks/{id} にリクエストを送り、更新されたタスクを返す関数
// id = どのタスクを更新するか（URLに含まれる番号）
// input = 更新後の内容
export async function updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    // createTask の POST と違い、PUT を使う
    // PUT = 「このURLにあるデータを、このJSONで上書きして」という意味
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  // 200 OK 以外はエラーとして扱う（404 = 存在しないタスク など）
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  return res.json();
}
