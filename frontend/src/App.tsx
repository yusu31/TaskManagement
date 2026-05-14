import { useState, useEffect, useCallback } from 'react';
import type { Task, SearchParams } from './types/task';
import { fetchTasks } from './api/taskApi';
import { SearchBar } from './components/SearchBar';
import { Board } from './components/Board';
import styles from './App.module.css';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>TaskBoard</h1>
      </header>
      <SearchBar
        onSearch={handleSearch}
        resultCount={tasks.length}
        isFiltered={isFiltered}
      />
      <Board tasks={tasks} loading={loading} error={error} />
    </div>
  );
}

export default App;
