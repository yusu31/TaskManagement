import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Task, Status, FilterState } from './types/task';
import { LABEL_COLORS } from './types/task';
import { fetchTasks, updateTask, deleteTask } from './api/taskApi';
import { LabelColorContext } from './context/LabelColorContext';
import { SearchBar } from './components/SearchBar';
import { Board } from './components/Board';
import { TaskCreateModal } from './components/TaskCreateModal';
import { TaskEditModal } from './components/TaskEditModal';
import { LabelManageModal } from './components/LabelManageModal';
import styles from './App.module.css';

function App() {
  // 全タスク（APIから取得したまま、フィルター前）
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // 絞り込み条件
  const [filter, setFilter] = useState<FilterState>({
    q: '',
    labels: [],
  });

  // タスク登録モーダル
  const [addingStatus, setAddingStatus]     = useState<Status>('TODO');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // タスク編集モーダル
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // ラベル管理モーダル
  const [isLabelManageOpen, setIsLabelManageOpen] = useState(false);

  // ラベル名 → パレットindex の対応表（localStorage で永続化）
  const [labelColorMap, setLabelColorMap] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('taskboard_label_colors') ?? '{}'); }
    catch { return {}; }
  });

  // カラム追加フォーム
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName]   = useState('');
  const columnInputRef = useRef<HTMLInputElement>(null);

  // ===== タスク読み込み =====
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // フィルターなしで全タスクを取得し、フロントエンドで絞り込む
      const data = await fetchTasks();
      // 新着順（ID降順）をデフォルトの並び順とする
      setAllTasks(data.sort((a, b) => b.id - a.id));
    } catch {
      setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ===== フロントエンドフィルター =====
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      // テキスト検索：タイトルに含まれるか
      if (filter.q && !t.title.toLowerCase().includes(filter.q.toLowerCase())) return false;
      // ラベルフィルター：選択されたラベルをすべて持つタスクのみ表示
      if (filter.labels.length > 0 && !filter.labels.some((l) => t.labels.includes(l))) return false;
      return true;
    });
  }, [allTasks, filter]);

  // 進捗カウント（DONE のタスク数 / 全タスク数）
  const doneCount = useMemo(
    () => allTasks.filter((t) => t.status === 'DONE').length,
    [allTasks]
  );

  // localStorageに保存したカスタムラベル（タスクに使われていなくても存在するラベル）
  const [customLabels, setCustomLabels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('taskboard_custom_labels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveCustomLabels = (labels: string[]) => {
    setCustomLabels(labels);
    localStorage.setItem('taskboard_custom_labels', JSON.stringify(labels));
  };

  // 全タスクに含まれるラベル ＋ カスタムラベルを合わせた一覧（重複除去・五十音順）
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    allTasks.forEach((t) => t.labels.forEach((l) => set.add(l)));
    customLabels.forEach((l) => set.add(l));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [allTasks, customLabels]);

  // allLabels に新しいラベルが増えたら、未使用のパレットindexを順番に割り当てる
  useEffect(() => {
    const usedIndices = new Set(Object.values(labelColorMap));
    const newMap = { ...labelColorMap };
    let changed = false;
    let nextIdx = 0;
    for (const label of allLabels) {
      if (newMap[label] === undefined) {
        // 16色すべて使い切った場合はループを抜けて色を再利用する
        let searched = 0;
        while (usedIndices.has(nextIdx % LABEL_COLORS.length) && searched < LABEL_COLORS.length) {
          nextIdx++;
          searched++;
        }
        const assignedIdx = nextIdx % LABEL_COLORS.length;
        newMap[label] = assignedIdx;
        usedIndices.add(assignedIdx);
        nextIdx++;
        changed = true;
      }
    }
    if (changed) {
      setLabelColorMap(newMap);
      localStorage.setItem('taskboard_label_colors', JSON.stringify(newMap));
    }
  }, [allLabels]);

  // ===== ドラッグ&ドロップ =====
  const handleDrop = useCallback(
    async (taskId: number, newStatus: Status, toIndex: number) => {
      const task = allTasks.find((t) => t.id === taskId);
      if (!task) return;

      const isSameColumn = task.status === newStatus;

      // 楽観的更新：ドロップした位置に正確に挿入する
      setAllTasks((prev) => {
        // 移動するタスクを一旦除いた配列
        const without = prev.filter((t) => t.id !== taskId);
        // 移動先カラムのタスク一覧（移動タスクを除いた状態）
        const targetCol = without.filter((t) => t.status === newStatus);
        const others    = without.filter((t) => t.status !== newStatus);

        // 同じカラム内の移動の場合、元の位置が toIndex より前にあるとインデックスがずれるので補正する
        let insertIndex = toIndex;
        if (isSameColumn) {
          const origIdx = prev
            .filter((t) => t.status === newStatus)
            .findIndex((t) => t.id === taskId);
          if (origIdx < toIndex) insertIndex = toIndex - 1;
        }
        // 範囲外にならないようにクランプ
        insertIndex = Math.max(0, Math.min(insertIndex, targetCol.length));

        const newTargetCol = [
          ...targetCol.slice(0, insertIndex),
          { ...task, status: newStatus },
          ...targetCol.slice(insertIndex),
        ];
        return [...others, ...newTargetCol];
      });

      // 別カラムへの移動のときだけ API を呼ぶ（同一カラム内の並び替えはフロント管理）
      if (!isSameColumn) {
        try {
          await updateTask(taskId, {
            title: task.title,
            description: task.description ?? undefined,
            priority: task.priority,
            status: newStatus,
            dueDate: task.dueDate ?? undefined,
          });
        } catch {
          // 失敗したら元の状態に戻す
          setAllTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
          );
          alert('移動に失敗しました。もう一度お試しください。');
        }
      }
    },
    [allTasks]
  );

  // ===== タスク登録・更新 =====
  const handleAddTask = (status: Status) => {
    setAddingStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (task: Task) => setEditingTask(task);

  const handleCreated = () => load();
  const handleUpdated = () => load();
  const handleEditClose = () => setEditingTask(null);

  // ===== タスク削除 =====
  const handleDelete = useCallback(async (id: number) => {
    // 楽観的更新：APIの結果を待たずに画面からタスクを消す
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch {
      // 失敗したら再取得して元の状態に戻す
      load();
      alert('削除に失敗しました。もう一度お試しください。');
    }
  }, [load]);

  // ===== カラム追加フォーム =====
  const handleOpenAddColumn = () => {
    setIsAddingColumn(true);
    setNewColumnName('');
    setTimeout(() => columnInputRef.current?.focus(), 50);
  };

  const handleCancelAddColumn = () => {
    setIsAddingColumn(false);
    setNewColumnName('');
  };

  const handleConfirmAddColumn = () => {
    if (!newColumnName.trim()) return;
    alert(`「${newColumnName}」リストの追加機能は現在開発中です。\nバックエンドのリスト管理API実装後に対応します。`);
    handleCancelAddColumn();
  };

  const handleColumnInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirmAddColumn();
    if (e.key === 'Escape') handleCancelAddColumn();
  };

  return (
    <LabelColorContext.Provider value={labelColorMap}>
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>TaskBoard</h1>

        <div className={styles.headerSpacer} />
        {isAddingColumn ? (
          <div className={styles.addColumnForm}>
            <input
              ref={columnInputRef}
              type="text"
              className={styles.addColumnInput}
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={handleColumnInputKeyDown}
              placeholder="リスト名を入力..."
            />
            <button className={styles.addColumnConfirm} onClick={handleConfirmAddColumn}>追加</button>
            <button className={styles.addColumnCancel} onClick={handleCancelAddColumn}>キャンセル</button>
          </div>
        ) : (
          <button className={styles.addColumnBtn} onClick={handleOpenAddColumn} title="リストを追加">
            📑
          </button>
        )}
      </header>

      <SearchBar
        filter={filter}
        onFilterChange={setFilter}
        totalCount={allTasks.length}
        filteredCount={filteredTasks.length}
        allLabels={allLabels}
        doneCount={doneCount}
        onLabelManage={() => setIsLabelManageOpen(true)}
      />

      <Board
        tasks={filteredTasks}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddTask={handleAddTask}
        onDrop={handleDrop}
      />

      {isCreateModalOpen && (
        <TaskCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleCreated}
          initialStatus={addingStatus}
          allLabels={allLabels}
        />
      )}

      {isLabelManageOpen && (
        <LabelManageModal
          allLabels={allLabels}
          allTasks={allTasks}
          onClose={() => setIsLabelManageOpen(false)}
          onUpdated={() => { load(); }}
          onAddLabel={(label) => {
            if (!allLabels.includes(label)) saveCustomLabels([...customLabels, label]);
          }}
          onDeleteCustomLabel={(label) => {
            saveCustomLabels(customLabels.filter((l) => l !== label));
            const newMap = { ...labelColorMap };
            delete newMap[label];
            setLabelColorMap(newMap);
            localStorage.setItem('taskboard_label_colors', JSON.stringify(newMap));
          }}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={handleEditClose}
          onUpdated={handleUpdated}
          allLabels={allLabels}
        />
      )}
    </div>
    </LabelColorContext.Provider>
  );
}

export default App;
