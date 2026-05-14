import type { Task, SearchParams } from '../types/task';

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
