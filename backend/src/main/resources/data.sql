INSERT INTO tasks (id, title, description, priority, status, position, due_date, created_at, updated_at)
VALUES
(1, 'Spring Boot 環境構築', 'Spring Boot + PostgreSQL の開発環境をセットアップする', 'HIGH', 'DONE', 1, '2026-05-01', NOW(), NOW()),
(2, 'Read API 実装', 'GET /api/tasks と GET /api/tasks/{id} を実装する', 'HIGH', 'IN_PROGRESS', 2, '2026-05-15', NOW(), NOW()),
(3, 'Create API 実装', 'POST /api/tasks を実装する', 'MEDIUM', 'TODO', 3, '2026-05-30', NOW(), NOW()),
(4, 'Update API 実装', 'PUT /api/tasks/{id} を実装する', 'MEDIUM', 'TODO', 4, '2026-06-10', NOW(), NOW()),
(5, 'Delete API 実装', 'DELETE /api/tasks/{id} を実装する', 'LOW', 'TODO', 5, '2026-06-20', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 後続の CREATE API でシーケンスが衝突しないようリセット
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
