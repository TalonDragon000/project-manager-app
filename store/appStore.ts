import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, setDeviceId } from '@/lib/supabase';
import { getOrCreateDeviceId } from '@/lib/deviceId';
import type { Project, Task } from '@/types/database';

export const COLUMNS = ['High', 'Med', 'Low', 'Later', 'To Sort'] as const;
export type Column = typeof COLUMNS[number];

export const FIBONACCI = [1, 2, 3, 5, 8] as const;
export const QUICK_TAGS = ['Growth', 'Retention', 'Tech Debt', 'Core Loop', 'Bugfix'];
export const MOSCOW_OPTIONS = ['Must', 'Should', 'Could', "Won't"] as const;

export function calculateScore(r: number, i: number, c: number, e: number) {
  return ((r * i * c) / e).toFixed(1);
}

export function predictColumn(score: string, moscow: string): Column {
  if (moscow === "Won't") return 'Later';
  if (moscow === 'Must') return 'High';
  const s = parseFloat(score);
  if (s >= 25) return 'High';
  if (s >= 10) return 'Med';
  return 'Low';
}

export function getColumnAccentColor(col: string) {
  switch (col) {
    case 'High': return '#ec4899';
    case 'Med': return '#a855f7';
    case 'Low': return '#6366f1';
    case 'Later': return '#6b7280';
    default: return '#06b6d4';
  }
}

export function getColumnTextClass(col: string) {
  switch (col) {
    case 'High': return '#ec4899';
    case 'Med': return '#c084fc';
    case 'Later': return '#6b7280';
    default: return '#818cf8';
  }
}

export function useAppStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // deviceId is stored in a ref so it is available synchronously after init
  const deviceIdRef = useRef<string>('');

  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const projectTasks = tasks.filter(t => t.project_id === activeProjectId);
  const completedTasks = projectTasks.filter(t => t.completed);

  const loadData = useCallback(async () => {
    const [{ data: ps }, { data: ts }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at'),
      supabase.from('tasks').select('*').order('created_at'),
    ]);
    if (ps) {
      setProjects(ps);
      setActiveProjectId(prev => {
        if (prev && ps.find(p => p.id === prev)) return prev;
        return ps.length > 0 ? ps[0].id : null;
      });
    }
    if (ts) setTasks(ts);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Resolve device ID first, then inject it into Supabase headers,
      // then fetch data. This ensures RLS sees the correct header.
      const id = await getOrCreateDeviceId();
      deviceIdRef.current = id;
      setDeviceId(id);
      if (!cancelled) {
        setLoading(true);
        await loadData();
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadData]);

  const createProject = async (name: string, mission: string) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, mission, device_id: deviceIdRef.current })
      .select()
      .single();
    if (data && !error) {
      setProjects(prev => [...prev, data]);
      setActiveProjectId(data.id);
      return data;
    }
    return null;
  };

  const createTask = async (fields: Omit<Task, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...fields, device_id: deviceIdRef.current })
      .select()
      .single();
    if (data && !error) setTasks(prev => [...prev, data]);
    return data;
  };

  const updateTask = async (id: string, fields: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (data && !error) {
      setTasks(prev => prev.map(t => t.id === id ? data : t));
    }
    return data;
  };

  const completeTask = async (id: string) => {
    return updateTask(id, { completed: true });
  };

  return {
    projects,
    tasks,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    projectTasks,
    completedTasks,
    loading,
    createProject,
    createTask,
    updateTask,
    completeTask,
    reload: loadData,
  };
}
