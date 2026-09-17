import { VIEW_CONFIG } from '@/lib/constants';
import { ViewId } from '@/lib/types';
import { BookOpen, Moon, Sun, MessageCircle, Globe, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  projectTitle: string;
}

export function Sidebar({ activeView, onNavigate, projectTitle }: SidebarProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('story-forge-theme');
    const prefersDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('story-forge-theme', next ? 'dark' : 'light');
  };

  return (
    <aside className="w-64 shrink-0 bg-ink-900 text-ink-100 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-ink-800">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg font-semibold text-ink-50">Story Forge</h1>
            <p className="text-xs text-ink-400 truncate max-w-[180px]">{projectTitle}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group mb-2 ${
            activeView === 'dashboard'
              ? 'bg-ink-700 text-ink-50'
              : 'text-ink-300 hover:bg-ink-800/60 hover:text-ink-100'
          }`}
        >
          <LayoutDashboard
            className="shrink-0 mt-0.5"
            style={{ width: 18, height: 18 }}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight">Dashboard</div>
            <div className="text-xs text-ink-500 leading-tight mt-0.5">
              Overview, progress, and guidance
            </div>
          </div>
        </button>

        <div className="px-3 py-1.5">
          <p className="text-xs font-medium text-ink-600 uppercase tracking-wider">AI Conversations</p>
        </div>

        <button
          onClick={() => onNavigate('chat')}
          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group mb-2 ${
            activeView === 'chat'
              ? 'bg-amber-600 text-white'
              : 'text-ink-300 hover:bg-ink-800/60 hover:text-ink-100'
          }`}
        >
          <MessageCircle
            className="shrink-0 mt-0.5"
            style={{ width: 18, height: 18 }}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight">Story Chat</div>
            <div className="text-xs text-ink-500 leading-tight mt-0.5">
              AI builds your story through conversation
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('worldchat')}
          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group mb-2 ${
            activeView === 'worldchat'
              ? 'bg-teal-600 text-white'
              : 'text-ink-300 hover:bg-ink-800/60 hover:text-ink-100'
          }`}
        >
          <Globe
            className="shrink-0 mt-0.5"
            style={{ width: 18, height: 18 }}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-tight">World Chat</div>
            <div className="text-xs text-ink-500 leading-tight mt-0.5">
              AI builds your world through conversation
            </div>
          </div>
        </button>

        <div className="px-3 py-1.5">
          <p className="text-xs font-medium text-ink-600 uppercase tracking-wider">Story Layers</p>
        </div>

        {VIEW_CONFIG.filter((v) => v.id !== 'dashboard').map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => onNavigate(view.id)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group ${
                active
                  ? 'bg-ink-800 text-ink-50'
                  : 'text-ink-400 hover:bg-ink-800/60 hover:text-ink-200'
              }`}
            >
              <Icon
                className={`shrink-0 mt-0.5 transition-colors ${
                  active ? 'text-amber-400' : 'text-ink-500 group-hover:text-ink-300'
                }`}
                style={{ width: 18, height: 18 }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium leading-tight">{view.label}</div>
                <div className="text-xs text-ink-500 leading-tight mt-0.5 truncate">
                  {view.description}
                </div>
              </div>
            </button>
          );
        })}

      </nav>

      <div className="px-3 py-3 border-t border-ink-800">
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-ink-400 hover:bg-ink-800/60 hover:text-ink-200 transition-all duration-200 text-left"
        >
          {dark ? <Sun className="shrink-0" style={{ width: 18, height: 18 }} /> : <Moon className="shrink-0" style={{ width: 18, height: 18 }} />}
          <span className="text-sm font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}
