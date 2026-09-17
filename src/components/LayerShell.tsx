import { useState, useCallback } from 'react';
import { MessageCircle, Settings2 } from 'lucide-react';
import { LayerChat, LayerMode } from './LayerChat';

interface LayerShellProps {
  projectId: string;
  mode: LayerMode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  coldStartQuestions: string[];
  manualView: React.ReactNode;
  onDataExtracted?: () => void;
}

export function LayerShell({
  projectId,
  mode,
  title,
  subtitle,
  icon,
  accentColor,
  coldStartQuestions,
  manualView,
  onDataExtracted,
}: LayerShellProps) {
  const [tab, setTab] = useState<'chat' | 'manual'>('chat');

  const handleDataExtracted = useCallback(() => {
    onDataExtracted?.();
  }, [onDataExtracted]);

  return (
    <div className="flex flex-col h-full">
      {/* View-level tabs */}
      <div className="px-8 pt-4 pb-0">
        <div className="flex gap-1 bg-ink-100 dark:bg-ink-900 rounded-lg p-1 w-fit">
          <button
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === 'chat'
                ? 'bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-100 shadow-sm'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300'
            }`}
            onClick={() => setTab('chat')}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            AI Chat
          </button>
          <button
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              tab === 'manual'
                ? 'bg-white dark:bg-ink-800 text-ink-800 dark:text-ink-100 shadow-sm'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-300'
            }`}
            onClick={() => setTab('manual')}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Hands-on
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === 'chat' ? (
        <div className="flex-1 min-h-0">
          <LayerChat
            projectId={projectId}
            mode={mode}
            title={title}
            subtitle={subtitle}
            icon={icon}
            accentColor={accentColor}
            coldStartQuestions={coldStartQuestions}
            onDataExtracted={handleDataExtracted}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin">{manualView}</div>
      )}
    </div>
  );
}
