import { useState } from 'react';
import type { CreateTaskInput, Priority, Status } from '../types/task';
import { createTask } from '../api/taskApi';
import styles from './TaskCreateModal.module.css';

// このコンポーネントが外から受け取るデータの型定義
interface Props {
  onClose: () => void;        // モーダルを閉じるときに呼ぶ関数
  onCreated: () => void;      // 登録成功後にボードを再取得するために呼ぶ関数
}

export function TaskCreateModal({ onClose, onCreated }: Props) {
  // --- フォームの各入力値を state で管理する ---
  // useState = 「この値が変わったら画面を再描画して」という React の仕組み
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]     = useState<Priority>('MEDIUM');
  const [status, setStatus]         = useState<Status>('TODO');
  const [dueDate, setDueDate]       = useState('');

  // 送信中かどうかを管理する（二重送信防止のため）
  const [submitting, setSubmitting] = useState(false);

  // エラーメッセージを管理する
  const [error, setError]           = useState<string | null>(null);

  // --- フォーム送信時の処理 ---
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault() = ブラウザのデフォルト動作（ページリロード）を止める
    // フォームはデフォルトでページをリロードしてしまうので必須
    e.preventDefault();

    setSubmitting(true);  // ボタンを無効化して二重送信を防ぐ
    setError(null);

    // 送るデータを組み立てる
    const input: CreateTaskInput = {
      title,
      description: description || undefined, // 空文字の場合は送らない
      priority,
      status,
      dueDate: dueDate || undefined,          // 空文字の場合は送らない
    };

    try {
      await createTask(input);  // API 呼び出し（非同期処理）
      onCreated();              // 親コンポーネントに「登録したよ」と知らせる
      onClose();                // モーダルを閉じる
    } catch {
      setError('登録に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);     // 送信中フラグを解除
    }
  };

  return (
    // オーバーレイ（暗い背景）をクリックしてもモーダルが閉じる
    <div className={styles.overlay} onClick={onClose}>
      {/* e.stopPropagation() = クリックイベントが親（overlay）に伝わるのを止める */}
      {/* モーダル内をクリックしても閉じないようにするための処理 */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>タスクを追加</h2>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* タイトル（必須） */}
          <label className={styles.label}>
            タイトル <span className={styles.required}>*</span>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}  // 入力のたびに state を更新
              placeholder="タスクのタイトルを入力"
              required
            />
          </label>

          {/* 説明（任意） */}
          <label className={styles.label}>
            説明
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="タスクの詳細を入力（任意）"
              rows={3}
            />
          </label>

          {/* 優先度・ステータスを横並びにする */}
          <div className={styles.row}>
            {/* 優先度（セレクトボックス） */}
            <label className={styles.label}>
              優先度
              <select
                className={styles.select}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="HIGH">高</option>
                <option value="MEDIUM">中</option>
                <option value="LOW">低</option>
              </select>
            </label>

            {/* ステータス（セレクトボックス） */}
            <label className={styles.label}>
              ステータス
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="TODO">未着手</option>
                <option value="IN_PROGRESS">進行中</option>
                <option value="DONE">完了</option>
              </select>
            </label>
          </div>

          {/* 期日（任意） */}
          <label className={styles.label}>
            期日
            <input
              type="date"
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          {/* エラーメッセージ（エラーがあるときだけ表示） */}
          {error && <p className={styles.error}>{error}</p>}

          {/* ボタンエリア */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}  // 送信中は押せないようにする
            >
              {submitting ? '登録中...' : '登録する'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
