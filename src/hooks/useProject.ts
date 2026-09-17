import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Project } from '@/lib/types';

export function useProject() {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to load projects:', error);
      setLoading(false);
      return;
    }

    const all = (data as Project[]) || [];
    setProjects(all);

    const storedId = localStorage.getItem('story-forge-active-project');
    const active = all.find((p) => p.id === storedId) || all[0] || null;

    if (active) {
      setProject(active);
      localStorage.setItem('story-forge-active-project', active.id);
    } else {
      setProject(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const selectProject = useCallback(async (id: string) => {
    const found = projects.find((p) => p.id === id);
    if (found) {
      setProject(found);
      localStorage.setItem('story-forge-active-project', id);
    }
  }, [projects]);

  const createProject = useCallback(async (title?: string) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: title || 'Untitled Story',
        genre: '',
        logline: '',
        notes: '',
      })
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Failed to create project:', error);
      return null;
    }

    const newProject = data as Project;
    await loadProjects();
    setProject(newProject);
    localStorage.setItem('story-forge-active-project', newProject.id);
    return newProject;
  }, [loadProjects]);

  const deleteProject = useCallback(async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete project:', error);
      return;
    }
    await loadProjects();
  }, [loadProjects]);

  const updateProject = useCallback(
    async (updates: Partial<Project>) => {
      if (!project) return;
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', project.id)
        .select('*')
        .maybeSingle();
      if (error) {
        console.error('Failed to update project:', error);
        return;
      }
      if (data) {
        setProject(data as Project);
        setProjects((prev) =>
          prev.map((p) => (p.id === (data as Project).id ? data as Project : p)),
        );
      }
    },
    [project],
  );

  return {
    project,
    projects,
    loading,
    updateProject,
    selectProject,
    createProject,
    deleteProject,
    reload: loadProjects,
  };
}
