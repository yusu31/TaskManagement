import { useState, useEffect, useCallback } from 'react';
import type { Task, SearchParams } from './types/task';
import { fetchTasks } from './api/taskApi';
import { SearchBar } from './components/SearchBar';
import { Board } from './components/Board';
import { TaskCreateModal } from './components/TaskCreateModal';
import styles from './App.module.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // モーダルの開閉状態を管理する state
  // false = 閉じている、true = 開いている
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isFiltered = Object.values(searchParams).some(Boolean);

  const load = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(params);
      setTasks(data);
    } catch (e) {
      setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(searchParams);
  }, [load, searchParams]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  // 登録完了後にボードを再取得する
  // TaskCreateModal の onCreated に渡す
  const handleCreated = () => {
    load(searchParams);  // 現在の検索条件のまま再取得して画面を更新
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>TaskBoard</h1>
        {/* ボタンをクリックしたらモーダルを開く */}
        <button
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          ＋ タスクを追加
        </button>
      </header>

      <SearchBar
        onSearch={handleSearch}
        resultCount={tasks.length}
        isFiltered={isFiltered}
      />
      <Board tasks={tasks} loading={loading} error={error} />

      {/* isModalOpen が true のときだけモーダルを表示する */}
      {/* React では「条件 && <コンポーネント>」で条件付きレンダリングができる */}
      {isModalOpen && (
        <TaskCreateModal
          onClose={() => setIsModalOpen(false)}  // 閉じるときは false に戻す
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

export default App;
