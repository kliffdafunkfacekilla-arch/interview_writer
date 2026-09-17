import { useState } from 'react';
import { useProject } from '@/hooks/useProject';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/views/ChatView';
import { WorldChatView } from '@/views/WorldChatView';
import { DashboardView } from '@/views/DashboardView';
import { CharactersView } from '@/views/CharactersView';
import { RelationshipsView } from '@/views/RelationshipsView';
import { PlotView } from '@/views/PlotView';
import { WorldView } from '@/views/WorldView';
import { MeaningView } from '@/views/MeaningView';
import { StyleView } from '@/views/StyleView';
import { GapsView } from '@/views/GapsView';
import { OutputView } from '@/views/OutputView';
import { ViewId } from '@/lib/types';

function App() {
  const { project, projects, loading, updateProject, selectProject, createProject, deleteProject } = useProject();
  const [view, setView] = useState<ViewId>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ink-300 border-t-ink-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-ink-400">Loading Story Forge...</p>
        </div>
      </div>
    );
  }

  const projectId = project?.id ?? null;
  const projectTitle = project?.title || 'Untitled Story';

  return (
    <div className="flex min-h-screen bg-ink-50 dark:bg-ink-950">
      <Sidebar activeView={view} onNavigate={setView} projectTitle={projectTitle} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {view === 'chat' && <ChatView projectId={projectId} />}
        {view === 'worldchat' && <WorldChatView projectId={projectId} />}
        {view === 'dashboard' && (
          <DashboardView
            project={project}
            projects={projects}
            onUpdateProject={updateProject}
            onSelectProject={selectProject}
            onCreateProject={createProject}
            onDeleteProject={deleteProject}
            onNavigate={setView}
          />
        )}
        {view === 'characters' && <CharactersView projectId={projectId} />}
        {view === 'relationships' && <RelationshipsView projectId={projectId} />}
        {view === 'plot' && <PlotView projectId={projectId} />}
        {view === 'world' && <WorldView projectId={projectId} />}
        {view === 'meaning' && <MeaningView projectId={projectId} />}
        {view === 'style' && <StyleView projectId={projectId} />}
        {view === 'gaps' && <GapsView projectId={projectId} />}
        {view === 'output' && <OutputView projectId={projectId} />}
      </main>
    </div>
  );
}

export default App;
